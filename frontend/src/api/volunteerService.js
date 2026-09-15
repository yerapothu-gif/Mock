// Volunteer API Service Layer
// Documented Routes:
// POST /api/villages
// GET /api/villages
// GET /api/villages/:id
// PUT /api/villages/:id
// POST /api/villages/:villageId/farmers
// GET /api/villages/:villageId/farmers
// POST /api/villages/:villageId/needs-assessment
// GET /api/villages/:villageId/needs-assessment
// PUT /api/needs-assessment/:id
// POST /api/sync/batch

import {
  getVolunteerStore,
  saveVolunteerStore,
  getOfflineQueue,
  saveOfflineQueue
} from './mockVolunteerStore';

export const volunteerService = {
  // 1. Volunteer Profile
  async getProfile() {
    const store = getVolunteerStore();
    return store.profile;
  },

  // 2. Villages
  async getVillages({ search = '', stage = 'all', district = 'all' } = {}) {
    const store = getVolunteerStore();
    let result = [...store.villages];

    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.block.toLowerCase().includes(q) ||
        v.district.toLowerCase().includes(q) ||
        (v.majorCrops && v.majorCrops.some(c => c.toLowerCase().includes(q)))
      );
    }

    if (stage && stage !== 'all') {
      result = result.filter(v => v.readinessStage === stage);
    }

    if (district && district !== 'all') {
      result = result.filter(v => v.district.toLowerCase() === district.toLowerCase());
    }

    return result;
  },

  async getVillageById(id) {
    const store = getVolunteerStore();
    const village = store.villages.find(v => v._id === id || v.offlineId === id);
    if (!village) throw new Error('Village not found');
    return village;
  },

  async createVillage(payload, isOnline = true) {
    if (!payload.name || !payload.district || !payload.block) {
      throw new Error('Village name, district, and block are required.');
    }

    const offlineId = payload.offlineId || `uuid-village-${Date.now()}`;
    const newVillage = {
      _id: `vil-${Date.now()}`,
      name: payload.name.trim(),
      district: payload.district.trim(),
      block: payload.block.trim(),
      location: payload.location || { type: "Point", coordinates: [77.6, 22.8] },
      farmerCount: Number(payload.farmerCount) || 0,
      majorCrops: Array.isArray(payload.majorCrops) ? payload.majorCrops : (payload.majorCrops ? payload.majorCrops.split(',').map(s => s.trim()) : []),
      waterResources: Array.isArray(payload.waterResources) ? payload.waterResources : (payload.waterResources ? payload.waterResources.split(',').map(s => s.trim()) : []),
      acres: Number(payload.acres) || 0,
      communityStructures: payload.communityStructures || [],
      readinessStage: payload.readinessStage || "identified",
      activeVleId: null,
      status: isOnline ? "synced" : "pending",
      offlineId,
      createdAt: new Date().toISOString()
    };

    const store = getVolunteerStore();
    store.villages.unshift(newVillage);
    store.profile.stats.villagesVisited += 1;
    saveVolunteerStore(store);

    if (!isOnline) {
      this.queueOfflineRecord({
        offlineId,
        entityType: 'village',
        name: newVillage.name,
        title: `Village Registration — ${newVillage.name}`,
        action: 'create',
        payload: newVillage
      });
    }

    return {
      success: true,
      message: isOnline ? 'Village created successfully' : 'Village saved offline. Will sync when online.',
      data: newVillage
    };
  },

  async updateVillage(id, payload) {
    const store = getVolunteerStore();
    const idx = store.villages.findIndex(v => v._id === id || v.offlineId === id);
    if (idx === -1) throw new Error('Village not found');

    store.villages[idx] = {
      ...store.villages[idx],
      ...payload,
      updatedAt: new Date().toISOString()
    };
    saveVolunteerStore(store);

    return {
      success: true,
      message: 'Village updated successfully',
      data: store.villages[idx]
    };
  },

  // 3. Farmers
  async getFarmers(villageId = null) {
    const store = getVolunteerStore();
    if (!villageId || villageId === 'all') return store.farmers;
    return store.farmers.filter(f => f.villageId === villageId);
  },

  async createFarmer(villageId, payload, isOnline = true) {
    if (!payload.name || !payload.phone) {
      throw new Error('Farmer name and phone are required.');
    }

    const store = getVolunteerStore();
    const targetVillage = store.villages.find(v => v._id === villageId || v.offlineId === villageId);
    const offlineId = payload.offlineId || `uuid-farmer-${Date.now()}`;

    const newFarmer = {
      _id: `farm-${Date.now()}`,
      villageId,
      villageName: targetVillage?.name || "Unassigned Village",
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      contactInfo: { phone: payload.phone.trim(), address: payload.address || "" },
      landSize: Number(payload.landSize) || 0,
      landholdingType: payload.landholdingType || "small",
      crops: Array.isArray(payload.crops) ? payload.crops : (payload.crops ? payload.crops.split(',').map(s => s.trim()) : []),
      isPotentialVLE: Boolean(payload.isPotentialVLE),
      notes: payload.notes || "",
      status: isOnline ? "synced" : "pending",
      offlineId,
      createdAt: new Date().toISOString()
    };

    store.farmers.unshift(newFarmer);
    store.profile.stats.farmersRegistered += 1;
    if (newFarmer.isPotentialVLE) {
      store.profile.stats.candidatesIdentified += 1;
    }

    if (targetVillage) {
      targetVillage.farmerCount = (targetVillage.farmerCount || 0) + 1;
    }

    saveVolunteerStore(store);

    if (!isOnline) {
      this.queueOfflineRecord({
        offlineId,
        entityType: 'farmer',
        name: newFarmer.name,
        title: `Farmer Registration — ${newFarmer.name}`,
        action: 'create',
        payload: newFarmer
      });
    }

    return {
      success: true,
      message: isOnline ? 'Farmer registered successfully' : 'Farmer saved offline.',
      data: newFarmer
    };
  },

  // 4. Needs Assessments
  async getAssessments(villageId = null) {
    const store = getVolunteerStore();
    if (!villageId || villageId === 'all') return store.assessments;
    return store.assessments.filter(a => a.villageId === villageId);
  },

  async createAssessment(villageId, payload, isOnline = true) {
    const store = getVolunteerStore();
    const targetVillage = store.villages.find(v => v._id === villageId || v.offlineId === villageId);
    const offlineId = payload.offlineId || `uuid-survey-${Date.now()}`;

    const newAssessment = {
      _id: `ass-${Date.now()}`,
      villageId,
      villageName: targetVillage?.name || "Village",
      processesEvaluated: payload.processesEvaluated || [],
      gapsIdentified: payload.gapsIdentified || [],
      farmerRequests: payload.farmerRequests || [],
      summaryNotes: payload.summaryNotes || "",
      conductedBy: store.profile.name,
      status: isOnline ? "synced" : "pending",
      offlineId,
      createdAt: new Date().toISOString()
    };

    store.assessments.unshift(newAssessment);
    store.profile.stats.assessmentsCompleted += 1;

    // Advance village readiness to 'assessed' if it was 'identified'
    if (targetVillage && targetVillage.readinessStage === 'identified') {
      targetVillage.readinessStage = 'assessed';
    }

    saveVolunteerStore(store);

    if (!isOnline) {
      this.queueOfflineRecord({
        offlineId,
        entityType: 'assessment',
        name: `${targetVillage?.name || 'Village'} Needs Assessment`,
        title: `Needs Assessment — ${targetVillage?.name || 'Village'}`,
        action: 'create',
        payload: newAssessment
      });
    }

    return {
      success: true,
      message: isOnline ? 'Needs assessment submitted successfully' : 'Needs assessment saved offline.',
      data: newAssessment
    };
  },

  // 5. VLE Candidates (Identified through farmer registry & field screening)
  async getVLECandidates() {
    const store = getVolunteerStore();
    // Return all farmers marked as isPotentialVLE
    return store.farmers.filter(f => f.isPotentialVLE);
  },

  async registerVLECandidate(payload, isOnline = true) {
    const store = getVolunteerStore();
    const targetVillage = store.villages.find(v => v._id === payload.villageId || v.offlineId === payload.villageId);
    const offlineId = `uuid-vle-cand-${Date.now()}`;

    const newCandidate = {
      _id: `farm-${Date.now()}`,
      villageId: payload.villageId,
      villageName: targetVillage?.name || "Village",
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      contactInfo: { phone: payload.phone.trim(), address: payload.address || "" },
      landSize: Number(payload.landSize) || 2.0,
      landholdingType: payload.landholdingType || "small",
      crops: payload.crops ? (Array.isArray(payload.crops) ? payload.crops : payload.crops.split(',').map(s => s.trim())) : ["Wheat", "Paddy"],
      isPotentialVLE: true,
      notes: payload.notes || "Identified as candidate VLE by field volunteer.",
      status: isOnline ? "synced" : "pending",
      offlineId,
      createdAt: new Date().toISOString()
    };

    store.farmers.unshift(newCandidate);
    store.profile.stats.candidatesIdentified += 1;
    saveVolunteerStore(store);

    if (!isOnline) {
      this.queueOfflineRecord({
        offlineId,
        entityType: 'farmer',
        name: newCandidate.name,
        title: `VLE Candidate Registration — ${newCandidate.name}`,
        action: 'create',
        payload: newCandidate
      });
    }

    return {
      success: true,
      message: 'VLE Candidate registered successfully',
      data: newCandidate
    };
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

  async syncBatch(onProgress) {
    const queue = getOfflineQueue();
    if (queue.length === 0) {
      return { success: true, count: 0, message: 'All records are already synced' };
    }

    // Update status to syncing
    queue.forEach(item => { item.status = 'syncing'; });
    saveOfflineQueue(queue);
    onProgress?.({ status: 'syncing', progress: 30 });

    // Simulate batch network processing time
    await new Promise(resolve => setTimeout(resolve, 1400));
    onProgress?.({ status: 'syncing', progress: 75 });

    // Update matching items in the main store to 'synced'
    const store = getVolunteerStore();
    queue.forEach(item => {
      if (item.entityType === 'village') {
        const v = store.villages.find(vil => vil.offlineId === item.offlineId);
        if (v) v.status = 'synced';
      } else if (item.entityType === 'farmer') {
        const f = store.farmers.find(fam => fam.offlineId === item.offlineId);
        if (f) f.status = 'synced';
      } else if (item.entityType === 'assessment') {
        const a = store.assessments.find(ass => ass.offlineId === item.offlineId);
        if (a) a.status = 'synced';
      }
    });
    saveVolunteerStore(store);

    const syncedCount = queue.length;
    // Clear offline queue
    saveOfflineQueue([]);
    onProgress?.({ status: 'synced', progress: 100 });

    return {
      success: true,
      count: syncedCount,
      message: `Successfully synchronized ${syncedCount} offline record${syncedCount === 1 ? '' : 's'} with Reaching Roots central servers.`
    };
  }
};
