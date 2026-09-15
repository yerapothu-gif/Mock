/**
 * Admin Data Service
 * Talks exclusively to the real Express/MongoDB backend via the shared
 * authenticated apiClient `request()` helper (adds the Bearer token,
 * normalizes errors as ApiError). No localStorage, no hardcoded fallback
 * data - every read/write goes to a real backend endpoint.
 */

import { request } from '../api/apiClient';

// ---------------------------------------------------------------------------
// Small normalization helpers - the real backend's field names/shapes differ
// in places from what AdminDashboard.jsx was built to render against (which
// was modeled on the old mock data). We adapt the data here so the component
// doesn't need structural rewrites.
// ---------------------------------------------------------------------------

function prettifyStage(stage) {
  if (!stage) return '';
  return stage
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function normalizeFarmer(f) {
  return {
    _id: f._id,
    name: f.name,
    contactInfo: f.contactInfo || f.phone || '',
    landSize: f.landSize,
    crops: f.crops || [],
    potentialVle: !!f.isPotentialVLE,
    notes: f.notes || '',
  };
}

// The real Village schema has no "viableStatus" field - readinessStage is the
// real source of truth. We derive a pending/confirmed flag from it so the
// existing UI (built around a mock "viableStatus" field) keeps working:
// 'identified' = not yet confirmed viable, 'assessed'/'vle-active' = confirmed.
function deriveViableStatus(readinessStage) {
  return readinessStage === 'identified' ? 'pending' : 'confirmed';
}

function normalizeVillage(village, farmers, assessment) {
  return {
    _id: village._id,
    name: village.name,
    district: village.district,
    block: village.block,
    location: village.location,
    farmerCount: village.farmerCount,
    majorCrops: village.majorCrops || [],
    waterResources: Array.isArray(village.waterResources)
      ? village.waterResources.join(', ')
      : village.waterResources || '',
    acres: village.acres,
    communityStructures: village.communityStructures || [],
    readinessStage: village.readinessStage,
    viableStatus: deriveViableStatus(village.readinessStage),
    status: village.status,
    activeVleId: village.activeVleId,
    syncedAt: village.updatedAt || village.createdAt,
    volunteerName: village.createdBy?.name || 'Field Volunteer',
    farmers: (farmers || []).map(normalizeFarmer),
    needsAssessment: {
      conductedBy: assessment?.conductedBy || '',
      processesEvaluated: (assessment?.processesEvaluated || []).map((p) => ({
        stage: prettifyStage(p.stage),
        notes: p.notes || p.challengesFaced || p.currentPractice || '',
      })),
      gapsIdentified: assessment?.gapsIdentified || [],
      farmerRequests: (assessment?.farmerRequests || []).map((r) => ({
        _id: r._id,
        farmerName: r.farmerName,
        requestType: r.requestType,
        urgency: capitalize(r.urgency),
        notes: r.notes || '',
        status: r.status,
      })),
    },
  };
}

function normalizeVLE(vle) {
  const villageId = vle.villageId && typeof vle.villageId === 'object' ? vle.villageId._id : vle.villageId;
  const villageName = vle.villageId && typeof vle.villageId === 'object' ? vle.villageId.name : vle.villageName;
  return {
    ...vle,
    villageId,
    villageName,
    contactInfo: vle.contactInfo?.phone || vle.phone || '',
    trainingCompleted: vle.trainingStatus === 'completed',
  };
}

function normalizeSupportRequest(r) {
  const vle = r.vleId && typeof r.vleId === 'object' ? r.vleId : null;
  return {
    ...r,
    vleId: vle?._id || r.vleId,
    vleName: vle?.name || r.vleName || 'Unknown VLE',
    villageName: vle?.villageId?.name || r.villageName || '',
  };
}

// Fetch every village along with its farmer roster and latest needs
// assessment. There is no single aggregate endpoint that returns this, so -
// same fan-out pattern used in volunteerService.js - we list villages then
// fetch each village's detail in parallel. Fine at this app's scale; would
// need a dedicated aggregate endpoint if the village count grows large.
async function loadVillagesFull() {
  const listRes = await request('/api/villages?limit=500');
  const villages = listRes?.data?.villages || [];

  const details = await Promise.all(
    villages.map(async (v) => {
      try {
        const detailRes = await request(`/api/villages/${v._id}`);
        return {
          village: detailRes?.data?.village || v,
          farmers: detailRes?.data?.farmers || [],
          assessment: detailRes?.data?.latestAssessment || null,
        };
      } catch {
        // If a single village's detail fetch fails, fall back to the list
        // record so one bad record doesn't break the whole dashboard.
        return { village: v, farmers: [], assessment: null };
      }
    })
  );

  return details;
}

export const adminDataService = {
  // 1. Villages & Synced Data
  async getVillages() {
    const details = await loadVillagesFull();
    return details.map((d) => normalizeVillage(d.village, d.farmers, d.assessment));
  },

  // Real Village schema has no "confirm viable" endpoint or field - the real
  // equivalent is advancing readinessStage past 'identified' via PUT
  // /api/villages/:id. If it's already past 'identified' this is a no-op PUT.
  async confirmViableVillage(villageId) {
    const current = await request(`/api/villages/${villageId}`);
    const stage = current?.data?.village?.readinessStage;
    const nextStage = stage === 'identified' ? 'assessed' : stage;
    await request(`/api/villages/${villageId}`, {
      method: 'PUT',
      body: JSON.stringify({ readinessStage: nextStage }),
    });
    return adminDataService.getVillages();
  },

  // 2. VLE Operations
  async getVLEs() {
    const res = await request('/api/vle');
    return (res?.data || []).map(normalizeVLE);
  },

  async onboardVLE({ name, contactInfo, villageId }) {
    await request('/api/vle', {
      method: 'POST',
      body: JSON.stringify({
        name,
        phone: contactInfo,
        contactInfo: { phone: contactInfo },
        villageId,
      }),
    });
    return adminDataService.getVLEs();
  },

  async markTrainingComplete(vleId) {
    await request(`/api/vle/${vleId}/training`, { method: 'PUT' });
    return adminDataService.getVLEs();
  },

  async assignEquipment(vleId, { machineType, machineId }) {
    await request(`/api/vle/${vleId}/equipment`, {
      method: 'PUT',
      body: JSON.stringify({ machineId, machineType }),
    });
    return adminDataService.getVLEs();
  },

  // 3. Rental Transactions & Performance Logs
  // There is no aggregate "all rental transactions" endpoint - admin can only
  // fetch logs per-VLE (GET /api/transactions/vle/:id). We fan out across
  // every VLE and flatten the results, same pattern as village farmers/
  // assessments in volunteerService.js.
  async getRentalLogs() {
    const vles = await adminDataService.getVLEs();
    const perVle = await Promise.all(
      vles.map(async (vle) => {
        try {
          const res = await request(`/api/transactions/vle/${vle._id}?limit=200`);
          const transactions = res?.data?.transactions || [];
          return transactions.map((t) => ({
            _id: t._id,
            transactionId: t._id,
            date: t.date ? new Date(t.date).toLocaleDateString() : '',
            vleId: vle._id,
            vleName: vle.name,
            villageName: t.villageId?.name || vle.villageName || '',
            farmerName: t.farmerName,
            machineId: t.machineId,
            machineType: t.machineType,
            hoursUsed: t.durationHours || 0,
            acresCovered: t.acresCovered || 0,
            rentalFee: t.feeCharged || 0,
            status: t.paymentStatus === 'paid' ? 'completed' : t.paymentStatus || t.syncStatus,
          }));
        } catch {
          return [];
        }
      })
    );
    return perVle.flat();
  },

  // 4. Open & Unfulfilled Farmer Requests
  // Farmer requests live embedded inside NeedsAssessment documents, not as a
  // standalone collection. GET /api/requests/open only returns open ones, but
  // the dashboard's filter also needs "fulfilled"/"all", so we derive the
  // full list (every status) from each village's latest assessment via the
  // same village fan-out used by getVillages().
  async getFarmerRequests() {
    const details = await loadVillagesFull();
    const requests = [];
    details.forEach(({ village, assessment }) => {
      (assessment?.farmerRequests || []).forEach((r) => {
        requests.push({
          _id: r._id,
          farmerName: r.farmerName,
          requestType: r.requestType,
          urgency: capitalize(r.urgency),
          notes: r.notes || '',
          status: r.status,
          villageId: village._id,
          villageName: village.name,
        });
      });
    });
    return requests;
  },

  async fulfillFarmerRequest(requestId) {
    await request(`/api/requests/${requestId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'fulfilled' }),
    });
    return adminDataService.getVillages();
  },

  // 5. Support / Contact Requests from VLEs
  async getSupportRequests() {
    const res = await request('/api/support/requests');
    return (res?.data || []).map(normalizeSupportRequest);
  },

  async respondToSupportRequest(requestId, responseText) {
    await request(`/api/support/requests/${requestId}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ adminResponse: responseText, status: 'resolved' }),
    });
    return adminDataService.getSupportRequests();
  },

  // 6. AI-Generated Machinery Need Reports
  // The real endpoint returns ONE aggregated report (a single global AI
  // summary + a per-village demand breakdown), not a list of independent
  // per-village AI reports like the mock UI expects. We turn each village's
  // demand entry into a "report card", and synthesize a short per-village
  // summary from its own data (the true AI summary is global, not
  // per-village, so it can't be honestly split up) - and add one extra card
  // at the top carrying the full real AI-generated executive summary.
  async getAIReports() {
    const res = await request('/api/reports/machinery-need');
    const data = res?.data;
    if (!data) return [];

    const cards = [];

    if (data.aiSummary) {
      cards.push({
        _id: 'overview',
        villageName: 'All Villages — Executive Summary',
        deficitScore: Math.min(100, (data.totalVillagesAnalyzed || 0) * 5),
        aiSummary: data.aiSummary,
        highDemandMachines: [],
        recommendedActions: [],
      });
    }

    (data.aggregatedDemand || []).forEach((item, idx) => {
      const highDemandMachines = Object.keys(item.demandsByType || {});
      const deficitScore = Math.min(
        100,
        (item.openRequestsCount || 0) * 20 + (item.operationalGaps || []).length * 10
      );
      cards.push({
        _id: `${item.villageName || 'village'}-${idx}`,
        villageName: item.villageName || 'Unknown Village',
        deficitScore,
        aiSummary: `${item.openRequestsCount || 0} open farmer request(s) in ${item.district || 'this district'}. Operational gaps: ${
          (item.operationalGaps || []).join(', ') || 'none reported'
        }.`,
        highDemandMachines,
        recommendedActions: (item.operationalGaps || []).map(
          (gap) => `Address: ${gap}`
        ),
      });
    });

    return cards;
  },
};

export default adminDataService;
