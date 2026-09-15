// API client with token management and offline local caching support

const BASE_URL = '/api';

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('rr_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getStoredToken = () => {
  return localStorage.getItem('rr_token') || '';
};

export const setAuthSession = (user, token) => {
  localStorage.setItem('rr_user', JSON.stringify(user));
  localStorage.setItem('rr_token', token);
};

export const clearAuthSession = () => {
  localStorage.removeItem('rr_user');
  localStorage.removeItem('rr_token');
};

export async function apiRequest(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || data.error || `HTTP ${response.status}: Request failed`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

// Auth APIs
export const authApi = {
  login: (phone, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    }),
  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  getMe: () => apiRequest('/auth/me'),
  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),
};

// Village APIs (Volunteer & Admin)
export const villageApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/villages${qs ? `?${qs}` : ''}`);
  },
  getMapPins: () => apiRequest('/villages/map'),
  getNearby: (lat, lng, radiusKm = 10) =>
    apiRequest(`/villages/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`),
  getById: (id) => apiRequest(`/villages/${id}`),
  create: (villageData) =>
    apiRequest('/villages', {
      method: 'POST',
      body: JSON.stringify(villageData),
    }),
  update: (id, updates) =>
    apiRequest(`/villages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  getFarmers: (villageId) => apiRequest(`/villages/${villageId}/farmers`),
  addFarmer: (villageId, farmerData) =>
    apiRequest(`/villages/${villageId}/farmers`, {
      method: 'POST',
      body: JSON.stringify(farmerData),
    }),
  getCandidates: (villageId) => apiRequest(`/villages/${villageId}/candidates`),
  getAssessments: (villageId) => apiRequest(`/villages/${villageId}/needs-assessment`),
  submitAssessment: (villageId, assessmentData) =>
    apiRequest(`/villages/${villageId}/needs-assessment`, {
      method: 'POST',
      body: JSON.stringify(assessmentData),
    }),
  updateAssessment: (id, updates) =>
    apiRequest(`/needs-assessment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  batchSync: (syncPayload) =>
    apiRequest('/sync/batch', {
      method: 'POST',
      body: JSON.stringify(syncPayload),
    }),
};

// Admin & VLE APIs
export const adminApi = {
  getAllVLEs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/vle${qs ? `?${qs}` : ''}`);
  },
  getVLEById: (id) => apiRequest(`/vle/${id}`),
  createVLE: (vleData) =>
    apiRequest('/vle', {
      method: 'POST',
      body: JSON.stringify(vleData),
    }),
  markTrainingComplete: (id) =>
    apiRequest(`/vle/${id}/training`, {
      method: 'PUT',
    }),
  assignEquipment: (id, equipData) =>
    apiRequest(`/vle/${id}/equipment`, {
      method: 'PUT',
      body: JSON.stringify(equipData),
    }),
  getVLELogs: (id) => apiRequest(`/vle/${id}/logs`),
  getOpenRequests: () => apiRequest('/requests/open'),
  updateRequestStatus: (requestId, status) =>
    apiRequest(`/requests/${requestId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getMachineryReport: () => apiRequest('/reports/machinery-need'),
  getAllSupportRequests: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/support/requests${qs ? `?${qs}` : ''}`);
  },
  respondSupportRequest: (id, adminResponse, status = 'resolved') =>
    apiRequest(`/support/requests/${id}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ adminResponse, status }),
    }),
};

// VLE APIs
export const vleApi = {
  getProfile: () => apiRequest('/vle/me'),
  getEquipment: () => apiRequest('/vle/me/equipment'),
  getTransactions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/vle/me/transactions${qs ? `?${qs}` : ''}`);
  },
  createTransaction: (txData) =>
    apiRequest('/vle/me/transactions', {
      method: 'POST',
      body: JSON.stringify(txData),
    }),
  getEarningsSummary: () => apiRequest('/vle/me/earnings/summary'),
  getWeeklyEarnings: () => apiRequest('/vle/me/earnings/weekly'),
  contactAdmin: (messageData) =>
    apiRequest('/vle/me/contact-admin', {
      method: 'POST',
      body: JSON.stringify(messageData),
    }),
  getMyContactRequests: () => apiRequest('/vle/me/contact-requests'),
};

// Offline local cache helpers for Field Volunteer
export const localStore = {
  getLocalDrafts: (key) => {
    try {
      const raw = localStorage.getItem(`rr_draft_${key}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  saveLocalDraft: (key, item) => {
    const drafts = localStore.getLocalDrafts(key);
    drafts.push({ ...item, _localSavedAt: new Date().toISOString() });
    localStorage.setItem(`rr_draft_${key}`, JSON.stringify(drafts));
  },
  clearLocalDrafts: (key) => {
    localStorage.removeItem(`rr_draft_${key}`);
  },
};
