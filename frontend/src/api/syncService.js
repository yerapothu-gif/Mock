// Offline synchronization service
// Documented endpoint: POST /api/sync/batch
// Request: { villages?: [], farmers?: [], assessments?: [], transactions: [...] }
// Handles offline queue, idempotency with offlineId, and batch upload

import { request } from './apiClient';

const OFFLINE_TXN_KEY = 'reachroots_offline_tx_queue_v1';

export const syncService = {
  /**
   * Generate UUID for offlineId
   */
  generateOfflineId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `uuid-rental-${crypto.randomUUID().slice(0, 8)}`;
    }
    return `uuid-rental-${Math.random().toString(36).substring(2, 10)}`;
  },

  /**
   * Get all transactions waiting to sync
   */
  getQueuedTransactions() {
    try {
      const raw = localStorage.getItem(OFFLINE_TXN_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Queue a transaction created while offline
   * @param {object} txn - transaction data
   */
  queueTransaction(txn) {
    const queue = this.getQueuedTransactions();
    const offlineTxn = {
      ...txn,
      offlineId: txn.offlineId || this.generateOfflineId(),
      syncStatus: 'pending',
      queuedAt: new Date().toISOString()
    };
    queue.push(offlineTxn);
    localStorage.setItem(OFFLINE_TXN_KEY, JSON.stringify(queue));

    return offlineTxn;
  },

  /**
   * Batch push queued transactions to backend
   */
  async syncBatch() {
    const queue = this.getQueuedTransactions();
    if (queue.length === 0) {
      return { syncedCount: 0, message: 'No records pending synchronization' };
    }

    const payload = {
      transactions: queue.map((t) => ({
        offlineId: t.offlineId,
        villageId: t.villageId,
        farmerName: t.farmerName,
        machineId: t.machineId,
        machineType: t.machineType,
        date: t.date,
        durationHours: t.durationHours,
        acresCovered: t.acresCovered,
        feeCharged: t.feeCharged,
        paymentStatus: t.paymentStatus
      }))
    };

    const res = await request('/api/sync/batch', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    // Clear queue upon confirmed sync
    localStorage.removeItem(OFFLINE_TXN_KEY);

    return {
      success: true,
      syncedCount: queue.length,
      data: res?.data || res
    };
  },

  clearQueue() {
    localStorage.removeItem(OFFLINE_TXN_KEY);
  }
};
