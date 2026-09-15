// VLE Rental Transaction Service
// Documented routes:
// POST /api/vle/me/transactions
// GET /api/vle/me/transactions?page=1&limit=20

import { request } from './apiClient';

export const transactionService = {
  /**
   * Log new rental transaction
   * @param {object} payload - documented fields: villageId, farmerName, machineId, machineType, date, durationHours, acresCovered, feeCharged, paymentStatus, offlineId
   */
  async createTransaction(payload) {
    // Validate required fields per schema
    if (!payload.farmerName || !payload.machineId || payload.durationHours === undefined || payload.feeCharged === undefined) {
      throw new Error('Validation error: farmerName, machineId, durationHours and feeCharged are required.');
    }

    const transactionData = {
      villageId: payload.villageId || "64f1a23b89efc1234567890a",
      farmerName: payload.farmerName.trim(),
      machineId: payload.machineId.trim(),
      machineType: payload.machineType || "Machinery",
      date: payload.date || new Date().toISOString(),
      durationHours: Number(payload.durationHours),
      acresCovered: Number(payload.acresCovered || 0),
      feeCharged: Number(payload.feeCharged),
      paymentStatus: payload.paymentStatus || "paid",
      offlineId: payload.offlineId || `uuid-rental-${Date.now()}`
    };

    return await request('/api/vle/me/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  },

  /**
   * Get transaction history with pagination
   * @param {number} page
   * @param {number} limit
   */
  async getTransactions(page = 1, limit = 20) {
    const res = await request(`/api/vle/me/transactions?page=${page}&limit=${limit}`, {
      method: 'GET'
    });
    // Backend nests the list and pagination under data: { transactions, pagination },
    // and names the page count "pages" rather than "totalPages". Normalize to the
    // flat { data: [...], pagination: { ..., totalPages } } shape consumers expect.
    const transactions = res?.data?.transactions ?? res?.data ?? [];
    const rawPagination = res?.data?.pagination ?? res?.pagination ?? null;
    const pagination = rawPagination
      ? { ...rawPagination, totalPages: rawPagination.totalPages ?? rawPagination.pages }
      : null;
    return { ...res, data: transactions, pagination };
  }
};
