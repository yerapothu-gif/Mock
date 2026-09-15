import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { vleService } from '../api/vleService';
import { transactionService } from '../api/transactionService';
import { StatCard } from '../components/common/StatCard';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { WeeklyEarningsChart } from '../components/dashboard/WeeklyEarningsChart';
import { RecordRentalModal } from '../components/transactions/RecordRentalModal';
import { StatusBadge } from '../components/common/StatusBadge';
import { IndianRupee, TrendingUp, Crop, Activity, Plus, Headphones, ChevronRight, Cpu } from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage({ onNavigate }) {
  const { user, vleProfile } = useAuth();
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rentalOpen, setRentalOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, weeklyRes, txnsRes, eqRes] = await Promise.all([
        vleService.getEarningsSummary(),
        vleService.getWeeklyEarnings(),
        transactionService.getTransactions(1, 5),
        vleService.getEquipment(),
      ]);
      setSummary(summaryRes);
      setWeekly(weeklyRes);
      setRecentTxns(txnsRes?.data || txnsRes || []);
      setEquipment(eqRes || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const vleFirstName = (vleProfile?.name || user?.name || 'VLE').split(' ')[0];

  if (loading) return <div className="page-container"><LoadingState message="Loading your dashboard..." /></div>;
  if (error) return <div className="page-container"><ErrorState error={error} onRetry={loadDashboard} /></div>;

  return (
    <>
      <RecordRentalModal
        isOpen={rentalOpen}
        onClose={() => setRentalOpen(false)}
        equipment={equipment}
        onSuccess={loadDashboard}
      />

      <div className="page-container">
        {/* Greeting */}
        <div style={{ marginBottom: 4 }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25 }}>
            {getGreeting()}, {vleFirstName} 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Here's your activity overview for today.</p>
        </div>

        {/* KPI Cards — from GET /api/vle/me/earnings/summary */}
        {summary && (
          <div className="stats-grid">
            <StatCard label="Total Earnings" value={`₹${summary.totalEarnings?.toLocaleString('en-IN') || 0}`} icon={IndianRupee} color="green" subtext="All-time accumulated" />
            <StatCard label="Total Rentals" value={summary.totalRentals ?? 0} icon={Activity} color="sage" subtext="Rental transactions logged" />
            <StatCard label="Acres Serviced" value={`${summary.acresServiced ?? 0}`} icon={Crop} color="amber" subtext="Total land covered (ac)" />
            <StatCard label="Estimated Utilization" value={`${summary.estimatedUtilizationPercent ?? 0}%`} icon={TrendingUp} color="blue" subtext="Equipment uptime rate" />
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions-bar">
          <button className="btn btn-primary btn-lg" onClick={() => setRentalOpen(true)} id="dashboard-record-rental-btn">
            <Plus size={18} /> Record Rental
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('support')} id="dashboard-contact-admin-btn">
            <Headphones size={16} /> Contact Admin
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => onNavigate('transactions')} style={{ marginLeft: 'auto' }}>
            View All Rentals <ChevronRight size={14} />
          </button>
        </div>

        {/* Weekly Earnings Chart — from GET /api/vle/me/earnings/weekly */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Weekly Performance</h3>
              <p className="card-subtitle">Earnings (₹) and operational hours by week</p>
            </div>
          </div>
          <div className="card-body">
            <WeeklyEarningsChart data={weekly} />
          </div>
        </div>

        {/* Bottom Row: Recent Transactions + Equipment Snapshot */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 20 }}>
          {/* Recent Transactions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Rentals</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('transactions')}>View All</button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {recentTxns.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No transactions yet.</div>
              ) : (
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Farmer</th>
                        <th>Machine</th>
                        <th>Fee</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTxns.map(txn => (
                        <tr key={txn._id}>
                          <td style={{ fontWeight: 600 }}>{txn.farmerName}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{txn.machineType}</td>
                          <td style={{ fontWeight: 700, color: 'var(--primary-800)' }}>₹{txn.feeCharged?.toLocaleString('en-IN')}</td>
                          <td><StatusBadge status={txn.paymentStatus} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Equipment Snapshot */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">My Equipment</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('equipment')}>View All</button>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {equipment.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No equipment assigned yet.</p>
              ) : equipment.slice(0, 3).map(eq => (
                <div key={eq._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--earth-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--earth-border)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-800)', flexShrink: 0 }}>
                    <Cpu size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{eq.machineType}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{eq.machineId}</p>
                  </div>
                  <StatusBadge status={eq.condition} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
