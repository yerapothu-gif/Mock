// VLE Rental Transaction Service
// Documented routes:
// POST /api/vle/me/transactions
// GET /api/vle/me/transactions?page=1&limit=20

import { request } from './apiClient';
import { getStoreData, saveStoreData } from './mockDataStore';

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

    try {
      const res = await request('/api/vle/me/transactions', {
        method: 'POST',
        body: JSON.stringify(transactionData)
      });
      return res;
    } catch (err) {
      if (err.status === 0 || err.status === 404 || err.status === 501) {
        // Fallback to local store
        const store = getStoreData();
        const newTxn = {
          _id: `txn-${Date.now()}`,
          vleId: store.profile._id,
          ...transactionData,
          syncStatus: 'synced',
          createdAt: new Date().toISOString()
        };
        store.transactions.unshift(newTxn);

        // Update weekly stats if applicable
        const currentWeek = store.weeklyEarnings[store.weeklyEarnings.length - 1];
        if (currentWeek) {
          currentWeek.earnings += newTxn.feeCharged;
          currentWeek.hours += Number(newTxn.durationHours);
        }

        saveStoreData(store);
        return {
          success: true,
          message: 'Rental transaction logged successfully',
          data: newTxn
        };
      }
      throw err;
    }
  },

  /**
   * Get transaction history with pagination
   * @param {number} page
   * @param {number} limit
   */
  async getTransactions(page = 1, limit = 20) {
    try {
      const res = await request(`/api/vle/me/transactions?page=${page}&limit=${limit}`, {
        method: 'GET'
      });
      return res;
    } catch (err) {
      if (err.status === 0 || err.status === 404 || err.status === 501) {
        const store = getStoreData();
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginated = store.transactions.slice(start, end);
        return {
          success: true,
          data: paginated,
          pagination: {
            total: store.transactions.length,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(store.transactions.length / limit) || 1
          }
        };
      }
      throw err;
    }
  }
};
