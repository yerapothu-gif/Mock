// Persistent local store initialized with documented data from API_DOCUMENTATION.md
// Used for reliable offline testing, network resiliency, and seamless demo experience

const STORAGE_KEY = 'reachroots_vle_store_v1';

const initialData = {
  profile: {
    _id: "64f9a781b23901c34567890b",
    name: "Suresh Sharma",
    phone: "9826012345",
    villageId: "64f1a23b89efc1234567890a",
    villageName: "Barkheda",
    district: "Raisen",
    block: "Obedullaganj",
    trainingStatus: "completed",
    trainingCompletedAt: "2026-08-15T09:00:00Z",
    accountStatus: "active",
    totalEarnings: 42500,
    totalRentalsCount: 28,
    totalAcresServiced: 64.5,
    contactInfo: {
      phone: "9826012345",
      email: "suresh@example.com",
      address: "Near Panchayat Bhavan, Barkheda, Raisen, MP"
    }
  },
  equipment: [
    {
      _id: "eq-001",
      machineId: "EQ-ROT-001",
      machineType: "Rotavator",
      model: "Shaktiman 6ft",
      serialNumber: "SHK-2024-8841",
      ownership: "Foundation",
      hourlyRate: 450,
      dailyRate: 3200,
      condition: "excellent",
      assignedDate: "2026-08-20T10:00:00Z"
    },
    {
      _id: "eq-002",
      machineId: "EQ-TRP-002",
      machineType: "Paddy Transplanter",
      model: "Kubota 4-Row Walk-Behind",
      serialNumber: "KUB-2023-1120",
      ownership: "Foundation",
      hourlyRate: 600,
      dailyRate: 4200,
      condition: "good",
      assignedDate: "2026-08-25T11:00:00Z"
    },
    {
      _id: "eq-003",
      machineId: "EQ-SPR-003",
      machineType: "Power Sprayer",
      model: "Aspee HTP 50 (50L Engine)",
      serialNumber: "ASP-2024-0542",
      ownership: "Foundation",
      hourlyRate: 250,
      dailyRate: 1800,
      condition: "good",
      assignedDate: "2026-09-01T09:30:00Z"
    }
  ],
  transactions: [
    {
      _id: "txn-101",
      vleId: "64f9a781b23901c34567890b",
      villageId: "64f1a23b89efc1234567890a",
      farmerName: "Ramesh Patel",
      machineId: "EQ-ROT-001",
      machineType: "Rotavator",
      date: "2026-09-15T09:30:00Z",
      durationHours: 3.5,
      acresCovered: 2.0,
      feeCharged: 1575,
      paymentStatus: "paid",
      syncStatus: "synced",
      offlineId: "uuid-rental-991",
      createdAt: "2026-09-15T09:30:00Z"
    },
    {
      _id: "txn-102",
      vleId: "64f9a781b23901c34567890b",
      villageId: "64f1a23b89efc1234567890a",
      farmerName: "Devendra Kushwaha",
      machineId: "EQ-TRP-002",
      machineType: "Paddy Transplanter",
      date: "2026-09-14T14:00:00Z",
      durationHours: 4.0,
      acresCovered: 3.2,
      feeCharged: 2400,
      paymentStatus: "paid",
      syncStatus: "synced",
      offlineId: "uuid-rental-985",
      createdAt: "2026-09-14T14:00:00Z"
    },
    {
      _id: "txn-103",
      vleId: "64f9a781b23901c34567890b",
      villageId: "64f1a23b89efc1234567890a",
      farmerName: "Mangilal Meena",
      machineId: "EQ-SPR-003",
      machineType: "Power Sprayer",
      date: "2026-09-13T08:15:00Z",
      durationHours: 2.5,
      acresCovered: 1.8,
      feeCharged: 625,
      paymentStatus: "pending",
      syncStatus: "synced",
      offlineId: "uuid-rental-979",
      createdAt: "2026-09-13T08:15:00Z"
    },
    {
      _id: "txn-104",
      vleId: "64f9a781b23901c34567890b",
      villageId: "64f1a23b89efc1234567890a",
      farmerName: "Sunita Bai",
      machineId: "EQ-ROT-001",
      machineType: "Rotavator",
      date: "2026-09-11T10:00:00Z",
      durationHours: 3.0,
      acresCovered: 2.5,
      feeCharged: 1350,
      paymentStatus: "paid",
      syncStatus: "synced",
      offlineId: "uuid-rental-962",
      createdAt: "2026-09-11T10:00:00Z"
    },
    {
      _id: "txn-105",
      vleId: "64f9a781b23901c34567890b",
      villageId: "64f1a23b89efc1234567890a",
      farmerName: "Kailash Lodhi",
      machineId: "EQ-ROT-001",
      machineType: "Rotavator",
      date: "2026-09-10T16:00:00Z",
      durationHours: 2.0,
      acresCovered: 1.5,
      feeCharged: 900,
      paymentStatus: "partial",
      syncStatus: "synced",
      offlineId: "uuid-rental-951",
      createdAt: "2026-09-10T16:00:00Z"
    }
  ],
  weeklyEarnings: [
    { week: "Week 33", earnings: 4200, hours: 10 },
    { week: "Week 34", earnings: 6800, hours: 16 },
    { week: "Week 35", earnings: 5900, hours: 13 },
    { week: "Week 36", earnings: 5200, hours: 14 },
    { week: "Week 37", earnings: 8100, hours: 19 },
    { week: "Week 38", earnings: 12300, hours: 26 }
  ],
  supportTickets: [
    {
      _id: "tkt-001",
      vleId: "64f9a781b23901c34567890b",
      category: "maintenance_issue",
      subject: "Blade wear on Rotavator EQ-ROT-001",
      message: "Blades are worn out after 50 hours of operation in rocky soil. Replacement set required.",
      urgency: "high",
      status: "in_progress",
      adminResponse: "Replacement blades dispatched from Bhopal warehouse. Expected arrival tomorrow.",
      createdAt: "2026-09-12T08:30:00Z",
      resolvedAt: null
    },
    {
      _id: "tkt-002",
      vleId: "64f9a781b23901c34567890b",
      category: "equipment_request",
      subject: "Request for Secondary Seed Drill Attachment",
      message: "High demand from Barkheda wheat farmers for seed drilling ahead of Rabi season.",
      urgency: "medium",
      status: "open",
      adminResponse: null,
      createdAt: "2026-09-14T11:20:00Z",
      resolvedAt: null
    },
    {
      _id: "tkt-003",
      vleId: "64f9a781b23901c34567890b",
      category: "farmer_feedback",
      subject: "Positive feedback on Paddy Transplanter efficiency",
      message: "Farmers reported 40% time savings and improved seedling spacing.",
      urgency: "low",
      status: "resolved",
      adminResponse: "Acknowledged! Shared with Agronomy field team.",
      createdAt: "2026-09-08T15:10:00Z",
      resolvedAt: "2026-09-09T10:00:00Z"
    }
  ]
};

export const getStoreData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed reading VLE store from localStorage:', err);
    return initialData;
  }
};

export const saveStoreData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed saving VLE store to localStorage:', err);
  }
};

// Reset store to initial seed data
export const resetStoreData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
};
