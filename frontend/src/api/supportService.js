// VLE Support & Contact Admin Service
// Documented routes:
// POST /api/vle/me/contact-admin
// GET /api/vle/me/contact-requests

import { request } from './apiClient';

export const supportService = {
  /**
   * Submit support request to admin
   * @param {object} payload - category, subject, message, urgency
   */
  async createTicket(payload) {
    if (!payload.subject || !payload.message || !payload.category) {
      throw new Error('Category, subject, and message are required.');
    }

    const ticketData = {
      category: payload.category,
      subject: payload.subject.trim(),
      message: payload.message.trim(),
      urgency: payload.urgency || 'medium'
    };

    return await request('/api/vle/me/contact-admin', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
  },

  /**
   * Get VLE's own support tickets
   */
  async getTickets() {
    const res = await request('/api/vle/me/contact-requests', {
      method: 'GET'
    });
    return res?.data || res;
  }
};
