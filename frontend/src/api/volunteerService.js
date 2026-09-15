// Volunteer API Service Layer — talks to the REAL backend (Express + MongoDB).
//
// Real Routes (verified against backend/src/routes/*.js + controllers, and
// smoke-tested live with curl against http://localhost:8000):
//   POST   /api/villages                              createVillage
//   GET    /api/villages                               -> { villages: [...], pagination }
//   GET    /api/villages/:id                            -> { village, farmers, latestAssessment }
//   PUT    /api/villages/:id                            updateVillage
//   POST   /api/villages/:villageId/farmers             addFarmer
//   GET    /api/villages/:villageId/farmers             getFarmersInVillage
//   GET    /api/villages/:villageId/candidates           ADMIN ONLY (requireRoles("admin")) — volunteers get 403.
//   POST   /api/villages/:villageId/needs-assessment     submitAssessment
//   GET    /api/villages/:villageId/needs-assessment     getAssessmentsForVillage
//   PUT    /api/needs-assessment/:id                    updateAssessment
//   POST   /api/sync/batch                              batchSyncOfflineData
//   GET    /api/auth/me                                 current user (used to build a "profile")
//
// Contract notes discovered while wiring this up:
// - There is NO flat "all farmers" / "all needs-assessments" endpoint — both are
//   strictly village-scoped. getFarmers(null|'all') / getAssessments(null|'all')
//   therefore fan out across every village the volunteer can see and merge results
//   client-side (this is a real, if chatty, aggregation — not mock data).
// - GET /api/villages/:villageId/candidates is admin-only. Volunteers cannot call
//   it. There is also no separate "VLE candidate" or contact-request creation
//   endpoint for volunteers — VLEContactRequest (backend/src/models/vleContactRequest.model.js)
//   is for an already-onboarded VLE to message admins about equipment/maintenance,
//   which is a different workflow entirely. So: getVLECandidates() aggregates
//   farmers flagged isPotentialVLE across villages, and registerVLECandidate()
//   is really just createFarmer() with isPotentialVLE forced true — exactly how a
//   volunteer nominates a candidate in the real data model.
// - Farmer documents have NO createdBy/volunteerId field (see backend/src/models/farmer.model.js),
//   so farmers cannot be scoped to "my farmers" — every signed-in volunteer sees
//   the same farmer pool. Village and NeedsAssessment documents DO carry
//   createdBy / conductedBy (set server-side from the JWT), so those can be
//   filtered to the current volunteer where useful (see getProfile stats).
// - Farmer.contactInfo is a plain String on the real schema (not the
//   { phone, address } object the old mock used) — mapped accordingly below.
// - Farmer.landSize is REQUIRED by the backend; Village.location.coordinates is
//   REQUIRED. Both are enforced client-side here too so failures surface early.

import { request, ApiError } from './apiClient';

const QUEUE_STORAGE_KEY = 'reachroots_volunteer_offline_queue_v1';

// ---------------------------------------------------------------------------
// Offline queue persistence (pure localStorage read/write — no fake data).
// This is legitimate offline-first plumbing: it stores records the volunteer
// created while offline until they can be pushed to the real backend.
// ---------------------------------------------------------------------------
function getOfflineQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOfflineQueue(queue) {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to save offline queue to localStorage:', err);
  }
}

function genOfflineId(prefix) {
  return `uuid-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// A request() failure with status 0 means the fetch itself never reached the
// server (network down / backend unreachable) — that's the only case where we
// fall back to the offline queue. A 400/401/403/404/etc is a real answer from
// the server and should surface as a real error, not be silently queued.
function isNetworkFailure(err) {
  return err instanceof ApiError && err.status === 0;
}

/**
 * Shared helper for every "create" style call: try the real backend when
 * online, and if that's not possible (explicitly offline, or a genuine
 * network failure while "online"), persist the record to the local offline
 * queue instead so it can be synced later via syncBatch().
 */
async function createOrQueue({ isOnline, entityType, offlineId, name, title, payload, send, successMessage }) {
  if (isOnline) {
    try {
      const res = await send();
      return {
        success: true,
        message: res?.message || successMessage,
        data: res?.data
      };
    } catch (err) {
      if (!isNetworkFailure(err)) {
        throw err;
      }
      // fall through to offline queue below
    }
  }

  const queuedRecord = { ...payload, offlineId, status: 'pending' };
  volunteerService.queueOfflineRecord({
    offlineId,
    entityType,
    name,
    title,
    action: 'create',
    payload
  });

  return {
    success: true,
    message: `${title} saved offline. Will sync when online.`,
    data: queuedRecord
  };
}

// ---------------------------------------------------------------------------
// Normalization helpers — the real backend's field names already match what
// the UI expects (name, district, majorCrops, readinessStage, etc.), so these
// only fill in the handful of values that require aggregation or unwrapping
// a populated reference (e.g. conductedBy coming back as {name, phone}).
// ---------------------------------------------------------------------------
function normalizeVillage(v) {
  return { ...v, status: v.status || 'synced' };
}

function normalizeFarmer(f, villageName) {
  return {
    ...f,
    villageName: f.villageName || villageName || '',
    status: f.status || 'synced'
  };
}

function normalizeAssessment(a, villageName) {
  const isPopulated = a.conductedBy && typeof a.conductedBy === 'object';
  const conductedByRaw = isPopulated ? a.conductedBy._id : a.conductedBy;
  const conductedBy = isPopulated ? (a.conductedBy.name || a.conductedBy.phone || 'Volunteer') : a.conductedBy;

  return {
    ...a,
    villageName: a.villageName || villageName || '',
    conductedBy,
    conductedByRaw,
    status: a.status || 'synced'
  };
}

export const volunteerService = {
  // 1. Volunteer Profile — real authenticated user + live-computed stats.
  // NOTE: the primary identity source in the app is now useAuth().user via
  // AuthContext/VolunteerAuthContext; this method is kept for API-surface
  // stability and for anything that wants a richer profile with real stats.
  async getProfile() {
    const res = await request('/api/auth/me', { method: 'GET' });
    const user = res?.data || res?.user || res;
    if (!user) return null;

    const stats = { villagesVisited: 0, farmersRegistered: 0, assessmentsCompleted: 0, candidatesIdentified: 0 };
    try {
      const villages = await this.getVillages();

      // Village.createdBy is set server-side from the JWT, so this is a real
      // "villages this volunteer created" count.
      stats.villagesVisited = villages.filter(v => {
        const creatorId = typeof v.createdBy === 'object' ? v.createdBy?._id : v.createdBy;
        return creatorId === user._id;
      }).length;

      // Farmer has no createdBy/volunteerId field on the real schema, so there
      // is no way to scope "farmers I registered" — every volunteer sees the
      // same farmer pool. We report the total visible to any volunteer rather
      // than fabricating per-volunteer attribution.
      const farmers = await this.getFarmers('all');
      stats.farmersRegistered = farmers.length;
      stats.candidatesIdentified = farmers.filter(f => f.isPotentialVLE).length;

      // NeedsAssessment.conductedBy IS set server-side from the JWT, so this
      // can be scoped to the current volunteer.
      const assessments = await this.getAssessments();
      stats.assessmentsCompleted = assessments.filter(a => {
        const raw = a.conductedByRaw ?? a.conductedBy;
        return raw === user._id;
      }).length;
    } catch (err) {
      console.warn('Failed to compute volunteer stats from live backend data:', err);
    }

    return { ...user, stats };
  },

  // 2. Villages
  async getVillages({ search = '', stage = 'all', district = 'all' } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (stage && stage !== 'all') params.set('stage', stage);
    if (district && district !== 'all') params.set('district', district);
    params.set('limit', '200');

    const res = await request(`/api/villages?${params.toString()}`, { method: 'GET' });
    const villages = res?.data?.villages || [];
    return villages.map(normalizeVillage);
  },

  async getVillageById(id) {
    const res = await request(`/api/villages/${id}`, { method: 'GET' });
    const { village, farmers, latestAssessment } = res?.data || {};
    if (!village) throw new Error('Village not found');
    return { ...normalizeVillage(village), farmers: farmers || [], latestAssessment: latestAssessment || null };
  },

  async createVillage(payload, isOnline = true) {
    if (!payload.name || !payload.district || !payload.block) {
      throw new Error('Village name, district, and block are required.');
    }
    if (!payload.location?.coordinates || payload.location.coordinates.length !== 2) {
      throw new Error('Village GPS coordinates are required.');
    }

    const offlineId = payload.offlineId || genOfflineId('village');
    const body = {
      name: payload.name.trim(),
      district: payload.district.trim(),
      block: payload.block.trim(),
      location: payload.location,
      farmerCount: Number(payload.farmerCount) || 0,
      majorCrops: Array.isArray(payload.majorCrops)
        ? payload.majorCrops
        : (payload.majorCrops ? payload.majorCrops.split(',').map(s => s.trim()).filter(Boolean) : []),
      waterResources: Array.isArray(payload.waterResources)
        ? payload.waterResources
        : (payload.waterResources ? payload.waterResources.split(',').map(s => s.trim()).filter(Boolean) : []),
      acres: Number(payload.acres) || 0,
      communityStructures: payload.communityStructures || [],
      readinessStage: payload.readinessStage || 'identified',
      offlineId
    };

    return createOrQueue({
      isOnline,
      entityType: 'village',
      offlineId,
      name: body.name,
      title: `Village Registration — ${body.name}`,
      payload: body,
      successMessage: 'Village created successfully',
      send: () => request('/api/villages', { method: 'POST', body: JSON.stringify(body) })
    });
  },

  async updateVillage(id, payload) {
    try {
      const res = await request(`/api/villages/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      return { success: true, message: res?.message || 'Village updated successfully', data: normalizeVillage(res?.data) };
    } catch (err) {
      if (isNetworkFailure(err)) {
        throw new Error('Cannot update village while offline. Please retry once connectivity is restored.', { cause: err });
      }
      throw err;
    }
  },

  // 3. Farmers
  // The real backend only exposes farmers per-village, so villageId === null
  // (or 'all') fans out across every visible village and merges the results.
  async getFarmers(villageId = null) {
    if (!villageId || villageId === 'all') {
      const villages = await this.getVillages();
      const perVillage = await Promise.all(
        villages.map(v =>
          request(`/api/villages/${v._id}/farmers`, { method: 'GET' })
            .then(res => (res?.data || []).map(f => normalizeFarmer(f, v.name)))
            .catch(() => [])
        )
      );
      return perVillage.flat();
    }

    const [farmersRes, village] = await Promise.all([
      request(`/api/villages/${villageId}/farmers`, { method: 'GET' }),
      this.getVillageById(villageId).catch(() => null)
    ]);
    const villageName = village?.name || '';
    return (farmersRes?.data || []).map(f => normalizeFarmer(f, villageName));
  },

  async createFarmer(villageId, payload, isOnline = true) {
    if (!payload.name || !payload.name.trim()) {
      throw new Error('Farmer name is required.');
    }
    if (payload.landSize === undefined || payload.landSize === null || Number.isNaN(Number(payload.landSize))) {
      throw new Error('Farmer land size is required.');
    }

    const offlineId = payload.offlineId || genOfflineId('farmer');
    const body = {
      villageId,
      name: payload.name.trim(),
      phone: payload.phone ? payload.phone.trim() : '',
      // Real Farmer.contactInfo is a plain string, not { phone, address }.
      contactInfo: payload.address || payload.contactInfo || payload.phone || '',
      landSize: Number(payload.landSize),
      landholdingType: payload.landholdingType || 'small',
      crops: Array.isArray(payload.crops) ? payload.crops : (payload.crops ? payload.crops.split(',').map(s => s.trim()).filter(Boolean) : []),
      isPotentialVLE: Boolean(payload.isPotentialVLE),
      education: payload.education || undefined,
      sourcesOfIncome: Array.isArray(payload.sourcesOfIncome) ? payload.sourcesOfIncome : [],
      notes: payload.notes || '',
      offlineId
    };

    return createOrQueue({
      isOnline,
      entityType: 'farmer',
      offlineId,
      name: body.name,
      title: `Farmer Registration — ${body.name}`,
      payload: body,
      successMessage: 'Farmer registered successfully',
      send: () => request(`/api/villages/${villageId}/farmers`, { method: 'POST', body: JSON.stringify(body) })
    });
  },

  // 4. Needs Assessments — village-scoped only on the real backend, so (like
  // getFarmers) villageId === null / 'all' fans out and merges.
  async getAssessments(villageId = null) {
    if (!villageId || villageId === 'all') {
      const villages = await this.getVillages();
      const perVillage = await Promise.all(
        villages.map(v =>
          request(`/api/villages/${v._id}/needs-assessment`, { method: 'GET' })
            .then(res => (res?.data || []).map(a => normalizeAssessment(a, v.name)))
            .catch(() => [])
        )
      );
      return perVillage.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const [assessmentsRes, village] = await Promise.all([
      request(`/api/villages/${villageId}/needs-assessment`, { method: 'GET' }),
      this.getVillageById(villageId).catch(() => null)
    ]);
    const villageName = village?.name || '';
    return (assessmentsRes?.data || []).map(a => normalizeAssessment(a, villageName));
  },

  async createAssessment(villageId, payload, isOnline = true) {
    const offlineId = payload.offlineId || genOfflineId('survey');
    const body = {
      processesEvaluated: payload.processesEvaluated || [],
      gapsIdentified: payload.gapsIdentified || [],
      farmerRequests: payload.farmerRequests || [],
      summaryNotes: payload.summaryNotes || '',
      offlineId
    };

    let villageName = 'Village';
    try {
      const village = await this.getVillageById(villageId);
      villageName = village?.name || villageName;
    } catch {
      // best-effort only, used for offline queue display label
    }

    return createOrQueue({
      isOnline,
      entityType: 'assessment',
      offlineId,
      name: `${villageName} Needs Assessment`,
      title: `Needs Assessment — ${villageName}`,
      payload: { ...body, villageId },
      successMessage: 'Needs assessment submitted successfully',
      send: () => request(`/api/villages/${villageId}/needs-assessment`, { method: 'POST', body: JSON.stringify(body) })
    });
  },

  // 5. VLE Candidates
  // No dedicated endpoint exists for volunteers (see file header). Candidates
  // are just farmers flagged isPotentialVLE, aggregated across all villages.
  async getVLECandidates() {
    const farmers = await this.getFarmers('all');
    return farmers.filter(f => f.isPotentialVLE);
  },

  async registerVLECandidate(payload, isOnline = true) {
    if (!payload.villageId) {
      throw new Error('Please select a village for this candidate.');
    }
    const result = await this.createFarmer(
      payload.villageId,
      { ...payload, landSize: payload.landSize || 2.0, isPotentialVLE: true },
      isOnline
    );
    return { ...result, message: 'VLE Candidate registered successfully' };
  },

  // 6. Offline & Batch Sync Engine
  getOfflineQueue() {
    return getOfflineQueue();
  },

  queueOfflineRecord(item) {
    const queue = getOfflineQueue();
    const queueItem = {
      ...item,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    queue.unshift(queueItem);
    saveOfflineQueue(queue);
    return queueItem;
  },

  // Actually pushes every queued record to POST /api/sync/batch (idempotent
  // via offlineId upserts server-side) instead of simulating success.
  async syncBatch(onProgress) {
    const queue = getOfflineQueue();
    if (queue.length === 0) {
      return { success: true, count: 0, message: 'All records are already synced' };
    }

    queue.forEach(item => { item.status = 'syncing'; });
    saveOfflineQueue(queue);
    onProgress?.({ status: 'syncing', progress: 30 });

    const batch = { villages: [], farmers: [], assessments: [], transactions: [] };
    for (const item of queue) {
      if (item.entityType === 'village') batch.villages.push(item.payload);
      else if (item.entityType === 'farmer') batch.farmers.push(item.payload);
      else if (item.entityType === 'assessment') batch.assessments.push(item.payload);
    }

    try {
      const res = await request('/api/sync/batch', { method: 'POST', body: JSON.stringify(batch) });
      onProgress?.({ status: 'syncing', progress: 90 });

      const syncedCount = queue.length;
      saveOfflineQueue([]);
      onProgress?.({ status: 'synced', progress: 100 });

      const counts = res?.data;
      const detail = counts
        ? ` (${counts.villages.created + counts.farmers.created + counts.assessments.created} created, ${counts.villages.updated + counts.farmers.updated + counts.assessments.updated} updated)`
        : '';

      return {
        success: true,
        count: syncedCount,
        message: `Successfully synchronized ${syncedCount} offline record${syncedCount === 1 ? '' : 's'} with Reaching Roots central servers${detail}.`
      };
    } catch (err) {
      // Leave the queue as-is (still pending) so the volunteer can retry.
      queue.forEach(item => { item.status = 'pending'; });
      saveOfflineQueue(queue);
      onProgress?.({ status: 'error', progress: 0 });

      if (isNetworkFailure(err)) {
        throw new Error('Sync failed: server unreachable. Records remain queued locally.', { cause: err });
      }
      throw new Error(err.message || 'Sync failed. Records remain queued locally.', { cause: err });
    }
  }
};
