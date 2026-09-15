// VLE Profile, Equipment, and Earnings Service
// Documented routes:
// GET /api/vle/me
// GET /api/vle/me/equipment
// GET /api/vle/me/earnings/summary
// GET /api/vle/me/earnings/weekly

import { request, ApiError } from './apiClient';
import { getStoreData, saveStoreData } from './mockDataStore';

export const vleService = {
  /**
   * Get logged-in VLE profile
   * Gate: If accountStatus === "locked", returns 403 Forbidden
   */
  async getProfile() {
    try {
      const res = await request('/api/vle/me', { method: 'GET' });
      return res?.data || res;
    } catch (err) {
      if (err.status === 403) {
        throw err;
      }
      if (err.status === 0 || err.status === 404 || err.status === 501) {
        const store = getStoreData();
        if (store.profile.accountStatus === 'locked') {
          throw new ApiError(403, 'Training incomplete. Account is locked.', {
            accountStatus: 'locked',
            trainingStatus: 'pending'
          });
        }
        return store.profile;
      }
      throw err;
    }
  },

  /**
   * Get assigned equipment for VLE
   */
  async getEquipment() {
    try {
      const res = await request('/api/vle/me/equipment', { method: 'GET' });
      return res?.data || res;
    } catch (err) {
      if (err.status === 0 || err.status === 404 || err.status === 501) {
        const store = getStoreData();
        return store.equipment;
      }
      throw err;
    }
  },

  /**
   * Get earnings summary KPIs
   * Documented fields: totalEarnings, totalRentals, acresServiced, estimatedUtilizationPercent
   */
  async getEarningsSummary() {
    try {
      const res = await request('/api/vle/me/earnings/summary', { method: 'GET' });
      const data = res?.data || res;
      // Backend returns { allTimeEarnings, totalRentals, totalAcresServiced,
      // last30Days: { estimatedUtilizationPercent } }. Normalize to the flat
      // { totalEarnings, totalRentals, acresServiced, estimatedUtilizationPercent }
      // shape the dashboard UI (and the mock fallback below) expect.
      return {
        totalEarnings: data?.totalEarnings ?? data?.allTimeEarnings ?? 0,
        totalRentals: data?.totalRentals ?? 0,
        acresServiced: data?.acresServiced ?? data?.totalAcresServiced ?? 0,
        estimatedUtilizationPercent:
          data?.estimatedUtilizationPercent ?? data?.last30Days?.estimatedUtilizationPercent ?? 0,
      };
    } catch (err) {
      if (err.status === 0 || err.status === 404 || err.status === 501) {
        const store = getStoreData();
        // Calculate dynamically from transactions if any added
        const totalEarnings = store.transactions.reduce((sum, t) => sum + (Number(t.feeCharged) || 0), 0) + store.profile.totalEarnings;
        const totalRentals = store.transactions.length + store.profile.totalRentalsCount;
        const acresServiced = Number((store.transactions.reduce((sum, t) => sum + (Number(t.acresCovered) || 0), 0) + store.profile.totalAcresServiced).toFixed(1));
        
        return {
          totalEarnings,
          totalRentals,
          acresServiced,
          estimatedUtilizationPercent: 72
        };
      }
      throw err;
    }
  },

  /**
   * Get weekly earnings and operational hours for charts
   * Returns: [{ week, earnings, hours }]
   */
  async getWeeklyEarnings() {
    try {
      const res = await request('/api/vle/me/earnings/weekly', { method: 'GET' });
      return res?.data || res;
    } catch (err) {
      if (err.status === 0 || err.status === 404 || err.status === 501) {
        const store = getStoreData();
        return store.weeklyEarnings;
      }
      throw err;
    }
  },

  /**
   * Helper method for testing account lock/unlock state
   */
  setAccountLockStatus(isLocked) {
    const store = getStoreData();
    store.profile.accountStatus = isLocked ? 'locked' : 'active';
    store.profile.trainingStatus = isLocked ? 'pending' : 'completed';
    saveStoreData(store);
  }
};
