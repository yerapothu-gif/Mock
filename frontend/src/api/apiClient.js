// API Client for Reaching Roots VLE portal
// Implements token injection, standardized HTTP error handling, and robust network fallback

const TOKEN_KEY = 'reachroots_access_token';

export const getAccessToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Standard HTTP request wrapper
 * @param {string} endpoint - e.g. '/api/vle/me'
 * @param {object} options - fetch options (method, body, headers, etc.)
 */
export async function request(endpoint, options = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(endpoint, config);

    // If 401 Unauthorized, notify or clear token if appropriate
    if (response.status === 401) {
      throw new ApiError(401, 'Unauthorized: Session expired or invalid token', await safeParseJson(response));
    }

    if (response.status === 403) {
      const errorBody = await safeParseJson(response);
      throw new ApiError(403, errorBody?.message || 'Forbidden: Training incomplete. Account is locked.', errorBody);
    }

    if (!response.ok) {
      const errorBody = await safeParseJson(response);
      const message = errorBody?.message || `Request failed with status ${response.status}`;
      throw new ApiError(response.status, message, errorBody);
    }

    return await safeParseJson(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network failure or backend server not running
    throw new ApiError(0, error.message || 'Network connection failure');
  }
}

async function safeParseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
