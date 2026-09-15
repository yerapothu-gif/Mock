// Centralized persistent Mock Data Store for Field Volunteer Role
// Strictly adheres to API_DOCUMENTATION.md schemas

const STORAGE_KEY = 'reachroots_volunteer_store_v1';
const QUEUE_STORAGE_KEY = 'reachroots_volunteer_offline_queue_v1';

const initialVolunteerProfile = {
  _id: "vol-901",
  name: "Ranjitha Rao",
  phone: "9876501234",
  email: "ranjitha.volunteer@reachingroots.org",
  role: "volunteer",
  district: "Raisen",
  state: "Madhya Pradesh",
  assignedBlocks: ["Obedullaganj", "Silwani", "Gairatganj"],
  joinedDate: "2026-06-10T09:00:00Z",
  stats: {
    villagesVisited: 12,
    farmersRegistered: 86,
    assessmentsCompleted: 9,
    candidatesIdentified: 6
  }
};

const initialVillages = [
  {
    _id: "vil-001",
    name: "Barkheda",
    district: "Raisen",
    block: "Obedullaganj",
    location: {
      type: "Point",
      coordinates: [77.6321, 22.8423]
    },
    farmerCount: 85,
    majorCrops: ["Soybean", "Wheat", "Gram"],
    waterResources: ["Canal", "Borewell"],
    acres: 350,
    communityStructures: [
      { type: "SHG", name: "Jai Kisan Mahila SHG", contactPerson: "Sunita Bai", phone: "9876543210" },
      { type: "FPO", name: "Raisen Krishi Vikas", contactPerson: "R. K. Meena", phone: "9826198765" }
    ],
    readinessStage: "assessed",
    activeVleId: null,
    status: "synced",
    offlineId: "uuid-village-001",
    createdAt: "2026-08-10T10:00:00Z"
  },
  {
    _id: "vil-002",
    name: "Rampura",
    district: "Raisen",
    block: "Silwani",
    location: {
      type: "Point",
      coordinates: [78.1245, 23.0112]
    },
    farmerCount: 126,
    majorCrops: ["Paddy", "Wheat", "Mustard"],
    waterResources: ["River Lift", "Wells"],
    acres: 480,
    communityStructures: [
      { type: "Panchayat", name: "Rampura Gram Panchayat", contactPerson: "Sarpanch Vikram Singh", phone: "9826011223" }
    ],
    readinessStage: "identified",
    activeVleId: null,
    status: "synced",
    offlineId: "uuid-village-002",
    createdAt: "2026-08-22T11:30:00Z"
  },
  {
    _id: "vil-003",
    name: "Lakshmipur",
    district: "Raisen",
    block: "Obedullaganj",
    location: {
      type: "Point",
      coordinates: [77.5891, 22.8945]
    },
    farmerCount: 94,
    majorCrops: ["Paddy", "Sugarcane", "Gram"],
    waterResources: ["Tube Wells"],
    acres: 310,
    communityStructures: [
      { type: "Cooperative", name: "Kisan Seva Sahakari Samiti", contactPerson: "Dinesh Patel", phone: "9876123456" }
    ],
    readinessStage: "vle-active",
    activeVleId: "vle-001",
    status: "synced",
    offlineId: "uuid-village-003",
    createdAt: "2026-07-15T08:00:00Z"
  },
  {
    _id: "vil-004",
    name: "Pipaliya",
    district: "Raisen",
    block: "Gairatganj",
    location: {
      type: "Point",
      coordinates: [78.2134, 23.3412]
    },
    farmerCount: 68,
    majorCrops: ["Soybean", "Maize", "Pulses"],
    waterResources: ["Check Dam", "Borewells"],
    acres: 240,
    communityStructures: [],
    readinessStage: "identified",
    activeVleId: null,
    status: "synced",
    offlineId: "uuid-village-004",
    createdAt: "2026-09-02T14:20:00Z"
  }
];

const initialFarmers = [
  {
    _id: "farm-001",
    villageId: "vil-001",
    villageName: "Barkheda",
    name: "Ramesh Patel",
    phone: "9876543211",
    contactInfo: { phone: "9876543211", address: "North Tola, Barkheda" },
    landSize: 3.5,
    landholdingType: "small",
    crops: ["Wheat", "Soybean"],
    isPotentialVLE: true,
    notes: "Progressive farmer with tractor driving experience and local youth leadership.",
    status: "synced",
    offlineId: "uuid-farmer-001",
    createdAt: "2026-08-12T09:00:00Z"
  },
  {
    _id: "farm-002",
    villageId: "vil-001",
    villageName: "Barkheda",
    name: "Devendra Kushwaha",
    phone: "9826078901",
    contactInfo: { phone: "9826078901", address: "Kushwaha Mohalla" },
    landSize: 1.8,
    landholdingType: "marginal",
    crops: ["Vegetables", "Gram"],
    isPotentialVLE: false,
    notes: "Requires power sprayer rental for vegetable pest management.",
    status: "synced",
    offlineId: "uuid-farmer-002",
    createdAt: "2026-08-14T10:15:00Z"
  },
  {
    _id: "farm-003",
    villageId: "vil-002",
    villageName: "Rampura",
    name: "Kailash Chand Lodhi",
    phone: "9893045612",
    contactInfo: { phone: "9893045612", address: "Near Canal road" },
    landSize: 7.2,
    landholdingType: "large",
    crops: ["Paddy", "Wheat"],
    isPotentialVLE: true,
    notes: "Mechanically inclined, owns a workshop in Silwani block.",
    status: "synced",
    offlineId: "uuid-farmer-003",
    createdAt: "2026-08-25T14:00:00Z"
  },
  {
    _id: "farm-004",
    villageId: "vil-002",
    villageName: "Rampura",
    name: "Savita Yadav",
    phone: "9876512399",
    contactInfo: { phone: "9876512399", address: "Gram Panchayat marg" },
    landSize: 4.5,
    landholdingType: "medium",
    crops: ["Paddy", "Mustard"],
    isPotentialVLE: false,
    notes: "Member of women self-help group, looking for transplanter services.",
    status: "synced",
    offlineId: "uuid-farmer-004",
    createdAt: "2026-08-26T16:30:00Z"
  },
  {
    _id: "farm-005",
    villageId: "vil-003",
    villageName: "Lakshmipur",
    name: "Mukesh Malviya",
    phone: "9826190876",
    contactInfo: { phone: "9826190876", address: "Main Bazaar" },
    landSize: 5.0,
    landholdingType: "medium",
    crops: ["Sugarcane", "Paddy"],
    isPotentialVLE: true,
    notes: "Interested in operating Foundation equipment for neighboring hamlets.",
    status: "synced",
    offlineId: "uuid-farmer-005",
    createdAt: "2026-07-20T11:00:00Z"
  }
];

const initialAssessments = [
  {
    _id: "ass-001",
    villageId: "vil-001",
    villageName: "Barkheda",
    processesEvaluated: [
      {
        stage: "land_preparation",
        challengesFaced: "High cost of hiring private tractors (₹900/hr); delay in field preparation",
        currentPractice: "Manual/bullock and private rental",
        notes: "Farmers delay sowing window by 10-14 days due to bullock shortage."
      },
      {
        stage: "spraying",
        challengesFaced: "No power sprayers available; hand compression sprayers cause uneven pest control",
        currentPractice: "Manual hand pump",
        notes: "Heavy incidence of pod borer in gram."
      },
      {
        stage: "harvesting",
        challengesFaced: "Labour wage spikes to ₹500/day during peak harvest",
        currentPractice: "Manual sickle harvesting",
        notes: "Loss of 10-15% grain due to unseasonal rain while waiting for labour."
      }
    ],
    gapsIdentified: [
      "Machinery shortage",
      "High rental cost",
      "Labour shortage",
      "Skilled operator shortage"
    ],
    farmerRequests: [
      {
        farmerName: "Ramesh Patel",
        requestType: "Rotavator",
        machineTypeNeeded: "Rotavator 6ft",
        urgency: "high",
        notes: "Needs for 3.5 acres wheat sowing before mid-November",
        status: "open"
      },
      {
        farmerName: "Devendra Kushwaha",
        requestType: "Power Sprayer",
        machineTypeNeeded: "HTP Engine Sprayer 50L",
        urgency: "medium",
        notes: "Vegetable protection against whitefly",
        status: "open"
      }
    ],
    summaryNotes: "Barkheda has high willingness to adopt subsidized Foundation machinery rentals. Needs Rotavator and Sprayer on priority.",
    conductedBy: "Ranjitha Rao",
    status: "synced",
    offlineId: "uuid-survey-001",
    createdAt: "2026-08-16T15:00:00Z"
  },
  {
    _id: "ass-002",
    villageId: "vil-003",
    villageName: "Lakshmipur",
    processesEvaluated: [
      {
        stage: "sowing_transplanting",
        challengesFaced: "Manual paddy transplantation takes 25 woman-days per acre",
        currentPractice: "Manual transplanting",
        notes: "High demand for mechanical transplanter."
      }
    ],
    gapsIdentified: [
      "Machinery shortage",
      "Labour shortage"
    ],
    farmerRequests: [
      {
        farmerName: "Mukesh Malviya",
        requestType: "Paddy Transplanter",
        machineTypeNeeded: "Kubota 4-Row Transplanter",
        urgency: "critical",
        notes: "Timely transplantation before monsoon end",
        status: "fulfilled"
      }
    ],
    summaryNotes: "Transplanter assigned successfully to VLE. Operating with good field coverage.",
    conductedBy: "Ranjitha Rao",
    status: "synced",
    offlineId: "uuid-survey-002",
    createdAt: "2026-07-28T12:00:00Z"
  }
];

const initialOfflineQueue = [
  {
    offlineId: "uuid-queue-101",
    entityType: "village",
    name: "Rampura",
    title: "Village GPS Update — Rampura",
    action: "create",
    payload: {
      name: "Rampura",
      district: "Raisen",
      block: "Silwani",
      location: { type: "Point", coordinates: [78.1245, 23.0112] },
      readinessStage: "identified"
    },
    timestamp: "2026-09-15T08:30:00Z",
    status: "pending"
  },
  {
    offlineId: "uuid-queue-102",
    entityType: "farmer",
    name: "Savita Yadav",
    title: "Farmer Registration — Savita Yadav",
    action: "create",
    payload: {
      name: "Savita Yadav",
      villageName: "Rampura",
      landSize: 4.5,
      landholdingType: "medium"
    },
    timestamp: "2026-09-15T09:15:00Z",
    status: "pending"
  },
  {
    offlineId: "uuid-queue-103",
    entityType: "assessment",
    name: "Rampura Needs Assessment",
    title: "Needs Assessment — Rampura",
    action: "create",
    payload: {
      villageName: "Rampura",
      gapsIdentified: ["Machinery shortage", "High rental cost"]
    },
    timestamp: "2026-09-15T10:45:00Z",
    status: "pending"
  }
];

export function getVolunteerStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const store = {
        profile: initialVolunteerProfile,
        villages: initialVillages,
        farmers: initialFarmers,
        assessments: initialAssessments
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      return store;
    }
    return JSON.parse(raw);
  } catch {
    return {
      profile: initialVolunteerProfile,
      villages: initialVillages,
      farmers: initialFarmers,
      assessments: initialAssessments
    };
  }
}

export function saveVolunteerStore(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function getOfflineQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(initialOfflineQueue));
      return initialOfflineQueue;
    }
    return JSON.parse(raw);
  } catch {
    return initialOfflineQueue;
  }
}

export function saveOfflineQueue(queue) {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to save queue to localStorage:', err);
  }
}
