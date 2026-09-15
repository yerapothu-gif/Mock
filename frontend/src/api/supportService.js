// VLE Support & Contact Admin Service
// Documented routes:
// POST /api/vle/me/contact-admin
// GET /api/vle/me/contact-requests

import { request } from './apiClient';
import { getStoreData, saveStoreData } from './mockDataStore';

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

    try {
      const res = await request('/api/vle/me/contact-admin', {
        method: 'POST',
        body: JSON.stringify(ticketData)
      });
      return res;
    } catch (err) {
      if (err.status === 0 || err.status === 404 || err.status === 501) {
        const store = getStoreData();
        const newTicket = {
          _id: `tkt-${Date.now()}`,
          vleId: store.profile._id,
          ...ticketData,
          status: 'open',
          adminResponse: null,
          createdAt: new Date().toISOString(),
          resolvedAt: null
        };
        store.supportTickets.unshift(newTicket);
        saveStoreData(store);
        return {
          success: true,
          message: 'Support request submitted to Admin',
          data: newTicket
        };
      }
      throw err;
    }
  },

  /**
   * Get VLE's own support tickets
   */
  async getTickets() {
    try {
      const res = await request('/api/vle/me/contact-requests', {
        method: 'GET'
      });
      return res?.data || res;
    } catch (err) {
      if (err.status === 0 || err.status === 404 || err.status === 501) {
        const store = getStoreData();
        return store.supportTickets;
      }
      throw err;
    }
  }
};
