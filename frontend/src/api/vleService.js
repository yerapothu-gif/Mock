// VLE Profile, Equipment, and Earnings Service
// Documented routes:
// GET /api/vle/me
// GET /api/vle/me/equipment
// GET /api/vle/me/earnings/summary
// GET /api/vle/me/earnings/weekly

import { request } from './apiClient';

export const vleService = {
  /**
   * Get logged-in VLE profile
   * Gate: If accountStatus === "locked", backend returns 403 Forbidden
   */
  async getProfile() {
    const res = await request('/api/vle/me', { method: 'GET' });
    const vle = res?.data || res;
    if (!vle) return vle;
    // Backend nests village details under a populated `villageId` object
    // ({ _id, name, district, block, location }). Flatten the commonly-used
    // fields onto the profile so the UI (ProfilePage) can read them directly
    // as villageName/district/block, same as before.
    const village = vle.villageId && typeof vle.villageId === 'object' ? vle.villageId : null;
    return village
      ? {
          ...vle,
          villageId: village._id,
          villageName: village.name,
          district: village.district,
          block: village.block,
        }
      : vle;
  },

  /**
   * Get assigned equipment for VLE
   */
  async getEquipment() {
    const res = await request('/api/vle/me/equipment', { method: 'GET' });
    return res?.data || res;
  },

  /**
   * Get earnings summary KPIs
   * Documented fields: totalEarnings, totalRentals, acresServiced, estimatedUtilizationPercent
   */
  async getEarningsSummary() {
    const res = await request('/api/vle/me/earnings/summary', { method: 'GET' });
    const data = res?.data || res;
    // Backend returns { allTimeEarnings, totalRentals, totalAcresServiced,
    // last30Days: { estimatedUtilizationPercent } }. Normalize to the flat
    // { totalEarnings, totalRentals, acresServiced, estimatedUtilizationPercent }
    // shape the dashboard UI expects.
    return {
      totalEarnings: data?.totalEarnings ?? data?.allTimeEarnings ?? 0,
      totalRentals: data?.totalRentals ?? 0,
      acresServiced: data?.acresServiced ?? data?.totalAcresServiced ?? 0,
      estimatedUtilizationPercent:
        data?.estimatedUtilizationPercent ?? data?.last30Days?.estimatedUtilizationPercent ?? 0,
    };
  },

  /**
   * Get weekly earnings and operational hours for charts
   * Returns: [{ week, earnings, hours }]
   */
  async getWeeklyEarnings() {
    const res = await request('/api/vle/me/earnings/weekly', { method: 'GET' });
    const data = res?.data || res || [];
    // Backend returns [{ label, week, year, earnings, hours, rentals, acres }].
    // Normalize to the flat { week, earnings, hours } shape the
    // WeeklyEarningsChart component and dashboard/earnings pages expect,
    // using the human-readable `label` (e.g. "W37 (2026)") for the week axis.
    return Array.isArray(data)
      ? data.map((w) => ({
          week: w.label || w.week,
          earnings: w.earnings ?? 0,
          hours: w.hours ?? 0,
        }))
      : [];
  }
};
