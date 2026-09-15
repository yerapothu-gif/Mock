import { useState, useEffect, useCallback } from 'react';
import { vleService } from '../api/vleService';
import { WeeklyEarningsChart } from '../components/dashboard/WeeklyEarningsChart';
import { StatCard } from '../components/common/StatCard';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { IndianRupee, TrendingUp, Clock, BarChart2 } from 'lucide-react';

export default function EarningsPage() {
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, weeklyRes] = await Promise.all([
        vleService.getEarningsSummary(),
        vleService.getWeeklyEarnings(),
      ]);
      setSummary(summaryRes);
      setWeekly(weeklyRes);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalHours = weekly.reduce((s, w) => s + (w.hours || 0), 0);
  const avgWeeklyEarnings = weekly.length > 0 ? Math.round(weekly.reduce((s, w) => s + (w.earnings || 0), 0) / weekly.length) : 0;

  return (
    <div className="page-container">
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>My Earnings</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>Track your rental income, operational hours, and utilization.</p>
      </div>

      {loading && <LoadingState message="Loading earnings..." />}
      {error && <ErrorState error={error} onRetry={load} />}

      {!loading && !error && (
        <>
          {/* KPI Cards from GET /api/vle/me/earnings/summary */}
          {summary && (
            <div className="stats-grid">
              <StatCard label="Total Earnings" value={`₹${summary.totalEarnings?.toLocaleString('en-IN') || 0}`} icon={IndianRupee} color="green" subtext="All-time" />
              <StatCard label="Total Rentals" value={summary.totalRentals ?? 0} icon={BarChart2} color="sage" subtext="Transactions logged" />
              <StatCard label="Acres Serviced" value={`${summary.acresServiced ?? 0} ac`} icon={TrendingUp} color="amber" />
              <StatCard label="Estimated Utilization" value={`${summary.estimatedUtilizationPercent ?? 0}%`} icon={TrendingUp} color="blue" subtext="Equipment uptime" />
            </div>
          )}

          {/* Additional metrics derived from weekly data */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 6 }}>Total Operational Hours</p>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalHours}h</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last {weekly.length} weeks</p>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 6 }}>Avg Weekly Earnings</p>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-700)' }}>₹{avgWeeklyEarnings.toLocaleString('en-IN')}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Per week average</p>
            </div>
          </div>

          {/* Weekly Earnings Chart from GET /api/vle/me/earnings/weekly */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Weekly Earnings & Hours</h3>
                <p className="card-subtitle">Rental income (₹) and operational hours by week</p>
              </div>
            </div>
            <div className="card-body">
              <WeeklyEarningsChart data={weekly} />
            </div>
          </div>

          {/* Week-by-week breakdown */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Weekly Breakdown</h3>
            </div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Earnings (₹)</th>
                    <th>Hours</th>
                    <th>Avg Rate (₹/hr)</th>
                  </tr>
                </thead>
                <tbody>
                  {weekly.map((w, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{w.week}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary-800)' }}>₹{w.earnings?.toLocaleString('en-IN')}</td>
                      <td>{w.hours}h</td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {w.hours > 0 ? `₹${Math.round(w.earnings / w.hours)}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
