// Authentication service for VLE Role
// Documented routes: POST /api/auth/login, GET /api/auth/me, POST /api/auth/logout

import { request, setAccessToken, getAccessToken } from './apiClient';

export const authService = {
  /**
   * Login user with phone and password
   * @param {string} phone
   * @param {string} password
   */
  async login(phone, password) {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password })
    });
    const accessToken = res?.accessToken || res?.data?.accessToken;
    if (accessToken) {
      setAccessToken(accessToken);
    }
    return res;
  },

  /**
   * Register a new Volunteer or VLE account
   * @param {string} name
   * @param {string} phone
   * @param {string} password
   * @param {'volunteer'|'vle'} role
   */
  async register(name, phone, password, role) {
    return await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, phone, password, role })
    });
  },

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser() {
    const token = getAccessToken();
    if (!token) return null;

    const res = await request('/api/auth/me', { method: 'GET' });
    return res?.user || res?.data;
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      setAccessToken(null);
    }
  }
};
