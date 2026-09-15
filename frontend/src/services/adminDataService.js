/**
 * Admin Data Service
 * Attempts to communicate with Express backend API endpoints.
 * Automatically falls back to high-fidelity rollback data with localStorage persistence
 * whenever MongoDB or the backend server is unreachable.
 */

const STORAGE_KEY_VILLAGES = 'reaching_roots_admin_villages';
const STORAGE_KEY_VLES = 'reaching_roots_admin_vles';
const STORAGE_KEY_REQUESTS = 'reaching_roots_admin_requests';
const STORAGE_KEY_RENTALS = 'reaching_roots_admin_rentals';
const STORAGE_KEY_SUPPORT = 'reaching_roots_admin_support';
const STORAGE_KEY_REPORTS = 'reaching_roots_admin_reports';

// Initial high-fidelity Rollback Dataset (Ratapani / Bhopal rural sanctuary belt)
const DEFAULT_VILLAGES = [
  {
    _id: 'vlg_001',
    name: 'Ratapani Khurd',
    location: { type: 'Point', coordinates: [77.498, 22.981] },
    farmerCount: 142,
    majorCrops: ['Khapli Wheat', 'Kodo Millet', 'Gram'],
    waterResources: 'Perennial Stream & 2 Borewells',
    acres: 380,
    readinessStage: 'identified', // 'identified' | 'assessed' | 'vle-active'
    viableStatus: 'pending', // 'pending' | 'confirmed'
    status: 'synced',
    communityStructures: [{ type: 'SHG', name: 'Narmada Mahila Samiti' }],
    syncedAt: '2026-09-14T10:30:00Z',
    volunteerName: 'Vikas Sharma',
    farmers: [
      { _id: 'f_101', name: 'Ramesh Patel', contactInfo: '+91 98261 11223', landSize: 4.5, crops: ['Khapli Wheat', 'Soybean'], potentialVle: true, notes: 'Has tractor driving license & SHG leadership experience' },
      { _id: 'f_102', name: 'Sunita Bai', contactInfo: '+91 97552 33445', landSize: 2.0, crops: ['Kodo Millet'], potentialVle: false, notes: 'Smallholder, actively attends bioresource meetings' },
      { _id: 'f_103', name: 'Ghanshyam Yadav', contactInfo: '+91 94250 55667', landSize: 6.0, crops: ['Wheat', 'Gram'], potentialVle: true, notes: 'Community opinion leader with spare barn for equipment storage' }
    ],
    needsAssessment: {
      conductedBy: 'Vikas Sharma',
      processesEvaluated: [
        { stage: 'Land Prep', notes: 'Severe tractor shortage during pre-monsoon window' },
        { stage: 'Sowing', notes: 'Traditional broadcasting causes 30% seed wastage; seed drill urgently needed' },
        { stage: 'Weeding', notes: 'Manual weeding labor shortage during peak flush' },
        { stage: 'Harvesting', notes: 'Post-harvest thresher hired from distant town at exorbitant rates' }
      ],
      gapsIdentified: ['Seed Drill Deficit', 'Power Weeder Shortage', 'Lack of Grain Cleaner'],
      farmerRequests: [
        { _id: 'req_1', farmerName: 'Ramesh Patel', requestType: 'Seed Drill', urgency: 'High', notes: 'Needed within 7 days for wheat sowing', status: 'open' },
        { _id: 'req_2', farmerName: 'Sunita Bai', requestType: 'Power Weeder', urgency: 'Medium', notes: 'Manual labor unavailable for weeding', status: 'open' }
      ]
    }
  },
  {
    _id: 'vlg_002',
    name: 'Bairagarh Kalan',
    location: { type: 'Point', coordinates: [77.342, 23.015] },
    farmerCount: 188,
    majorCrops: ['Soybean', 'Kutki Millet', 'Mustard'],
    waterResources: 'Seasonal Nallah & Check Dam',
    acres: 510,
    readinessStage: 'assessed',
    viableStatus: 'confirmed',
    status: 'synced',
    communityStructures: [{ type: 'FPO', name: 'Kisan Kalyan Samiti' }],
    syncedAt: '2026-09-13T16:15:00Z',
    volunteerName: 'Priya Meena',
    farmers: [
      { _id: 'f_201', name: 'Mohan Singh Lodhi', contactInfo: '+91 98931 77889', landSize: 5.0, crops: ['Soybean', 'Mustard'], potentialVle: true, notes: 'Mechanical aptitude, former workshop apprentice' },
      { _id: 'f_202', name: 'Kavita Verma', contactInfo: '+91 91114 99001', landSize: 3.2, crops: ['Kutki Millet'], potentialVle: false, notes: 'Interested in post-harvest millet processing' }
    ],
    needsAssessment: {
      conductedBy: 'Priya Meena',
      processesEvaluated: [
        { stage: 'Land Prep', notes: 'Local hiring cost is Rs. 1400/hr, unaffordable for smallholders' },
        { stage: 'Sowing', notes: 'Farmers requesting multi-crop planter' },
        { stage: 'Harvesting', notes: 'Rain threat during harvest; thresher needed quickly' }
      ],
      gapsIdentified: ['Multi-Crop Planter', 'Rotavator', 'Solar Dehydrator'],
      farmerRequests: [
        { _id: 'req_3', farmerName: 'Mohan Singh Lodhi', requestType: 'Rotavator', urgency: 'High', notes: 'Soil hardpan requires deep tillage', status: 'open' }
      ]
    }
  },
  {
    _id: 'vlg_003',
    name: 'Dahod Dam Forest Hamlet',
    location: { type: 'Point', coordinates: [77.581, 22.894] },
    farmerCount: 95,
    majorCrops: ['Indigenous Maize', 'Jowar', 'Lentils'],
    waterResources: 'Dam Backwater Canal',
    acres: 240,
    readinessStage: 'vle-active',
    viableStatus: 'confirmed',
    status: 'synced',
    communityStructures: [{ type: 'SHG', name: 'Vanvasi Vikas Mandal' }],
    syncedAt: '2026-09-11T09:00:00Z',
    volunteerName: 'Amit Chouhan',
    farmers: [
      { _id: 'f_301', name: 'Dinesh Gond', contactInfo: '+91 96300 22334', landSize: 3.8, crops: ['Indigenous Maize'], potentialVle: false, notes: 'Active renter of Foundation power weeder' }
    ],
    needsAssessment: {
      conductedBy: 'Amit Chouhan',
      processesEvaluated: [
        { stage: 'Weeding', notes: 'Successfully covered 45 acres via VLE Mahesh' }
      ],
      gapsIdentified: ['Multi-crop Thresher'],
      farmerRequests: [
        { _id: 'req_4', farmerName: 'Dinesh Gond', requestType: 'Thresher', urgency: 'Low', notes: 'Required next month during harvest', status: 'fulfilled' }
      ]
    }
  }
];

const DEFAULT_VLES = [
  {
    _id: 'vle_001',
    name: 'Mahesh Kumar Ahirwar',
    contactInfo: '+91 97130 88219',
    villageId: 'vlg_003',
    villageName: 'Dahod Dam Forest Hamlet',
    trainingStatus: 'completed',
    accountStatus: 'active', // 'locked' | 'active'
    assignedEquipment: [
      { machineId: 'MCH-PW-01', machineType: 'Heavy-Duty Power Weeder 7HP', ownership: 'Foundation', assignedDate: '2026-08-15' },
      { machineId: 'MCH-SD-04', machineType: 'Zero-Till Multi-Crop Seed Drill', ownership: 'Foundation', assignedDate: '2026-08-20' }
    ],
    totalEarnings: 34850,
    totalAcresCovered: 86.5,
    totalRentalHours: 114,
    rating: 4.8,
    createdAt: '2026-08-10T12:00:00Z'
  },
  {
    _id: 'vle_002',
    name: 'Devendra Malviya',
    contactInfo: '+91 98270 44192',
    villageId: 'vlg_002',
    villageName: 'Bairagarh Kalan',
    trainingStatus: 'pending',
    accountStatus: 'locked', // locked until admin marks training complete
    assignedEquipment: [
      { machineId: 'MCH-ROT-02', machineType: 'Tractor Rotavator 5 Feet', ownership: 'Foundation', assignedDate: '2026-09-02' }
    ],
    totalEarnings: 0,
    totalAcresCovered: 0,
    totalRentalHours: 0,
    rating: 5.0,
    createdAt: '2026-09-01T15:00:00Z'
  }
];

const DEFAULT_RENTALS = [
  {
    _id: 'tx_101',
    vleId: 'vle_001',
    vleName: 'Mahesh Kumar Ahirwar',
    farmerName: 'Dinesh Gond',
    villageName: 'Dahod Dam Forest Hamlet',
    machineId: 'MCH-PW-01',
    machineName: 'Heavy-Duty Power Weeder 7HP',
    date: '2026-09-12',
    durationHours: 5,
    acresCovered: 3.5,
    feeCharged: 1750,
    syncStatus: 'synced',
    notes: 'Weeding in maize field before fertilizer application'
  },
  {
    _id: 'tx_102',
    vleId: 'vle_001',
    vleName: 'Mahesh Kumar Ahirwar',
    farmerName: 'Kallu Ram',
    villageName: 'Dahod Dam Forest Hamlet',
    machineId: 'MCH-SD-04',
    machineName: 'Zero-Till Multi-Crop Seed Drill',
    date: '2026-09-10',
    durationHours: 6.5,
    acresCovered: 5.0,
    feeCharged: 2600,
    syncStatus: 'synced',
    notes: 'Precise line sowing of Khapli wheat demo plot'
  },
  {
    _id: 'tx_103',
    vleId: 'vle_001',
    vleName: 'Mahesh Kumar Ahirwar',
    farmerName: 'Shanti Devi',
    villageName: 'Dahod Dam Forest Hamlet',
    machineId: 'MCH-PW-01',
    machineName: 'Heavy-Duty Power Weeder 7HP',
    date: '2026-09-08',
    durationHours: 4,
    acresCovered: 2.8,
    feeCharged: 1400,
    syncStatus: 'synced',
    notes: 'Inter-row weeding in pulse intercropping'
  }
];

const DEFAULT_SUPPORT_REQUESTS = [
  {
    _id: 'sup_01',
    vleId: 'vle_001',
    vleName: 'Mahesh Kumar Ahirwar',
    type: 'Maintenance',
    urgency: 'High',
    message: 'Seed drill furrow opener blade got chipped on stony patch near riverbed. Need spare blade dispatched from Bhopal store.',
    status: 'open',
    date: '2026-09-14T08:30:00Z',
    adminResponse: ''
  },
  {
    _id: 'sup_02',
    vleId: 'vle_001',
    vleName: 'Mahesh Kumar Ahirwar',
    type: 'Equipment Request',
    urgency: 'Medium',
    message: 'Farmers in neighboring hamlet Jamun Tola requesting multi-crop thresher for October harvest. Demand exceeds 60 acres.',
    status: 'open',
    date: '2026-09-12T14:20:00Z',
    adminResponse: ''
  }
];

const DEFAULT_AI_REPORTS = [
  {
    _id: 'rep_01',
    title: 'Pre-Rabi Sowing Machinery Deficit Summary',
    generatedAt: '2026-09-14T18:00:00Z',
    model: 'gpt-4o-mini (Aggregated Pipeline)',
    summary: 'Across 3 surveyed sanctuary villages (425 smallholder farmers), a critical 82-acre bottleneck exists for Line Sowing and Seed Drills over the next 14 calendar days. In Ratapani Khurd, broadcast sowing is causing an estimated 28% yield reduction.',
    keyBottlenecks: [
      { village: 'Ratapani Khurd', gap: '35 farmers awaiting Zero-Till Seed Drill. Potential seed wastage: 1.8 Tons.' },
      { village: 'Bairagarh Kalan', gap: 'Hardpan soil requires immediate 5-ft rotavator tillage before soil moisture drops.' }
    ],
    recommendedAction: 'Deploy 2 additional Foundation-owned Seed Drills to Ratapani cluster and fast-track VLE Devendra training in Bairagarh Kalan to unlock rotavator operations.'
  },
  {
    _id: 'rep_02',
    title: 'Indigenous Crop Machinery Affordability Analysis',
    generatedAt: '2026-09-11T12:00:00Z',
    model: 'gpt-4o-mini (Aggregated Pipeline)',
    summary: 'Smallholder farmers cultivating Khapli wheat and Kodo millets report that commercial private rental charges (Rs. 1,400-1,800/hr) absorb 46% of their seasonal gross margin. Foundation VLE subsidized pricing (Rs. 350-450/hr) generates Rs. 1,120 net savings per acre.',
    keyBottlenecks: [
      { village: 'Dahod Dam Forest Hamlet', gap: 'High demand for specialized small-millet huller unit to eliminate manual pounding.' }
    ],
    recommendedAction: 'Procure 1 community-scale millet huller tagged as Foundation ownership and assign to VLE Mahesh Kumar.'
  }
];

// Helper to load or initialize localStorage
function loadLocal(key, defaultData) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('LocalStorage error, using default data', e);
  }
  return defaultData;
}

function saveLocal(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save error', e);
  }
}

export const adminDataService = {
  // 1. Villages & Synced Data
  async getVillages() {
    try {
      const res = await fetch('/api/villages');
      if (res.ok) {
        const data = await res.json();
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          return data.data;
        }
      }
    } catch {
      // Backend/DB offline: Fall back seamlessly to rollback data
    }
    return loadLocal(STORAGE_KEY_VILLAGES, DEFAULT_VILLAGES);
  },

  confirmViableVillage(villageId) {
    const villages = loadLocal(STORAGE_KEY_VILLAGES, DEFAULT_VILLAGES);
    const updated = villages.map((v) => {
      if (v._id === villageId) {
        return {
          ...v,
          viableStatus: 'confirmed',
          readinessStage: v.readinessStage === 'identified' ? 'assessed' : v.readinessStage
        };
      }
      return v;
    });
    saveLocal(STORAGE_KEY_VILLAGES, updated);
    return updated;
  },

  // 2. VLE Operations
  async getVLEs() {
    try {
      const res = await fetch('/api/vle');
      if (res.ok) {
        const data = await res.json();
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          return data.data;
        }
      }
    } catch {
      // Rollback fallback
    }
    return loadLocal(STORAGE_KEY_VLES, DEFAULT_VLES);
  },

  onboardVLE({ name, contactInfo, villageId, villageName }) {
    const vles = loadLocal(STORAGE_KEY_VLES, DEFAULT_VLES);
    const newVLE = {
      _id: `vle_${Date.now()}`,
      name,
      contactInfo,
      villageId,
      villageName,
      trainingStatus: 'pending',
      accountStatus: 'locked', // locked until marked complete
      assignedEquipment: [],
      totalEarnings: 0,
      totalAcresCovered: 0,
      totalRentalHours: 0,
      rating: 5.0,
      createdAt: new Date().toISOString()
    };
    const updated = [newVLE, ...vles];
    saveLocal(STORAGE_KEY_VLES, updated);
    return updated;
  },

  markTrainingComplete(vleId) {
    const vles = loadLocal(STORAGE_KEY_VLES, DEFAULT_VLES);
    const updated = vles.map((v) => {
      if (v._id === vleId) {
        return {
          ...v,
          trainingStatus: 'completed',
          accountStatus: 'active' // unlocks VLE account access
        };
      }
      return v;
    });
    saveLocal(STORAGE_KEY_VLES, updated);
    return updated;
  },

  assignEquipment(vleId, { machineType, machineId }) {
    const vles = loadLocal(STORAGE_KEY_VLES, DEFAULT_VLES);
    const updated = vles.map((v) => {
      if (v._id === vleId) {
        const newMachine = {
          machineId: machineId || `MCH-${Math.floor(100 + Math.random() * 900)}`,
          machineType,
          ownership: 'Foundation', // strictly tagged as Foundation
          assignedDate: new Date().toISOString().split('T')[0]
        };
        return {
          ...v,
          assignedEquipment: [...v.assignedEquipment, newMachine]
        };
      }
      return v;
    });
    saveLocal(STORAGE_KEY_VLES, updated);
    return updated;
  },

  // 3. Rental Transactions & Performance Logs
  async getRentalLogs() {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          return data.data;
        }
      }
    } catch {
      // Rollback fallback
    }
    return loadLocal(STORAGE_KEY_RENTALS, DEFAULT_RENTALS);
  },

  // 4. Open & Unfulfilled Farmer Requests
  getFarmerRequests() {
    const villages = loadLocal(STORAGE_KEY_VILLAGES, DEFAULT_VILLAGES);
    const requests = [];
    villages.forEach((v) => {
      if (v.needsAssessment?.farmerRequests) {
        v.needsAssessment.farmerRequests.forEach((req) => {
          requests.push({
            ...req,
            villageId: v._id,
            villageName: v.name
          });
        });
      }
    });
    return requests;
  },

  fulfillFarmerRequest(requestId) {
    const villages = loadLocal(STORAGE_KEY_VILLAGES, DEFAULT_VILLAGES);
    const updated = villages.map((v) => {
      if (v.needsAssessment?.farmerRequests) {
        const updatedReqs = v.needsAssessment.farmerRequests.map((r) => {
          if (r._id === requestId) {
            return { ...r, status: 'fulfilled' };
          }
          return r;
        });
        return {
          ...v,
          needsAssessment: { ...v.needsAssessment, farmerRequests: updatedReqs }
        };
      }
      return v;
    });
    saveLocal(STORAGE_KEY_VILLAGES, updated);
    return updated;
  },

  // 5. Support / Contact Requests from VLEs
  async getSupportRequests() {
    try {
      const res = await fetch('/api/support');
      if (res.ok) {
        const data = await res.json();
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          return data.data;
        }
      }
    } catch {
      // Rollback fallback
    }
    return loadLocal(STORAGE_KEY_SUPPORT, DEFAULT_SUPPORT_REQUESTS);
  },

  respondToSupportRequest(requestId, responseText) {
    const requests = loadLocal(STORAGE_KEY_SUPPORT, DEFAULT_SUPPORT_REQUESTS);
    const updated = requests.map((r) => {
      if (r._id === requestId) {
        return {
          ...r,
          status: 'resolved',
          adminResponse: responseText,
          respondedAt: new Date().toISOString()
        };
      }
      return r;
    });
    saveLocal(STORAGE_KEY_SUPPORT, updated);
    return updated;
  },

  // 6. AI-Generated Machinery Need Reports
  async getAIReports() {
    try {
      const res = await fetch('/api/reports/machinery-need');
      if (res.ok) {
        const data = await res.json();
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          return data.data;
        }
      }
    } catch {
      // Rollback fallback
    }
    return loadLocal(STORAGE_KEY_REPORTS, DEFAULT_AI_REPORTS);
  }
};

export default adminDataService;
