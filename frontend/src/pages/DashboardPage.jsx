import { useState, useEffect, useCallback } from 'react';
import { useVolunteerAuth } from '../context/VolunteerAuthContext';
import { useVolunteerOffline } from '../context/VolunteerOfflineContext';
import { volunteerService } from '../api/volunteerService';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { AddVillageModal } from '../components/villages/AddVillageModal';
import { VillageDetailModal } from '../components/villages/VillageDetailModal';
import { RegisterFarmerModal } from '../components/farmers/RegisterFarmerModal';
import { NewAssessmentModal } from '../components/assessments/NewAssessmentModal';
import { RegisterCandidateModal } from '../components/candidates/RegisterCandidateModal';
import {
  MapPin,
  Users,
  ClipboardList,
  RefreshCw,
  Plus,
  Award,
  ChevronRight,
  Navigation,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardPage({ onNavigate }) {
  const { volunteer } = useVolunteerAuth();
  const { pendingCount, isOnline } = useVolunteerOffline();

  const [villages, setVillages] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [addVillageOpen, setAddVillageOpen] = useState(false);
  const [registerFarmerOpen, setRegisterFarmerOpen] = useState(false);
  const [newAssessmentOpen, setNewAssessmentOpen] = useState(false);
  const [candidateOpen, setCandidateOpen] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vils, fams, asss] = await Promise.all([
        volunteerService.getVillages(),
        volunteerService.getFarmers(),
        volunteerService.getAssessments()
      ]);
      setVillages(vils);
      setFarmers(fams);
      setAssessments(asss);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const volunteerName = volunteer?.name ? volunteer.name.split(' ')[0] : 'Volunteer';

  // Recent activity items combining mock timeline
  const recentActivities = [
    {
      id: 'act-1',
      title: 'Needs Assessment Completed',
      target: 'Barkheda Village',
      meta: 'Evaluated land preparation & power spraying gaps',
      time: 'Today, 10:45 AM',
      icon: ClipboardList,
      color: 'green'
    },
    {
      id: 'act-2',
      title: 'Farmer Registered',
      target: 'Savita Yadav (Rampura)',
      meta: '4.5 acres, medium holding — Paddy, Mustard',
      time: 'Today, 09:15 AM',
      icon: Users,
      color: 'blue'
    },
    {
      id: 'act-3',
      title: 'Village Created & GPS Logged',
      target: 'Rampura (Silwani Block)',
      meta: '126 farmers, 480 cultivable acres',
      time: 'Today, 08:30 AM',
      icon: MapPin,
      color: 'terracotta'
    },
    {
      id: 'act-4',
      title: 'Potential VLE Identified',
      target: 'Ramesh Patel (Barkheda)',
      meta: 'Tractor driver with local community leadership',
      time: 'Yesterday, 04:20 PM',
      icon: Award,
      color: 'amber'
    }
  ];

  if (loading) return <div className="page-container"><LoadingState message="Loading your field activity..." /></div>;
  if (error) return <div className="page-container"><ErrorState message={error} onRetry={loadData} /></div>;

  return (
    <>
      {/* Modals */}
      <AddVillageModal
        isOpen={addVillageOpen}
        onClose={() => setAddVillageOpen(false)}
        onSuccess={() => loadData()}
      />
      <RegisterFarmerModal
        isOpen={registerFarmerOpen}
        onClose={() => setRegisterFarmerOpen(false)}
        villages={villages}
        onSuccess={() => loadData()}
      />
      <NewAssessmentModal
        isOpen={newAssessmentOpen}
        onClose={() => setNewAssessmentOpen(false)}
        villages={villages}
        onSuccess={() => loadData()}
      />
      <RegisterCandidateModal
        isOpen={candidateOpen}
        onClose={() => setCandidateOpen(false)}
        villages={villages}
        onSuccess={() => loadData()}
      />
      <VillageDetailModal
        village={selectedVillage}
        isOpen={Boolean(selectedVillage)}
        onClose={() => setSelectedVillage(null)}
        onOpenRegisterFarmer={(v) => {
          setSelectedVillage(null);
          setRegisterFarmerOpen(true);
        }}
        onOpenAssessment={(v) => {
          setSelectedVillage(null);
          setNewAssessmentOpen(true);
        }}
        onVillageUpdated={() => loadData()}
      />

      <div className="page-container">
        {/* Welcome Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary-900)' }}>
              {getGreeting()}, {volunteerName}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
              Here's your field activity overview for {volunteer?.district || 'Raisen'} District.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} /> {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="stat-card-grid">
          <StatCard
            label="Villages Visited"
            value={villages.length || 12}
            icon={MapPin}
            color="terracotta"
            subtext={`${villages.filter(v => v.readinessStage === 'vle-active').length} VLE Active`}
            onClick={() => onNavigate('villages')}
          />
          <StatCard
            label="Farmers Registered"
            value={farmers.length || 86}
            icon={Users}
            color="green"
            subtext={`${farmers.filter(f => f.isPotentialVLE).length} Potential VLEs`}
            onClick={() => onNavigate('farmers')}
          />
          <StatCard
            label="Assessments Completed"
            value={assessments.length || 9}
            icon={ClipboardList}
            color="blue"
            subtext="Agricultural needs mapped"
            onClick={() => onNavigate('assessments')}
          />
          <StatCard
            label="Pending Sync"
            value={pendingCount}
            icon={RefreshCw}
            color={pendingCount > 0 ? "amber" : "green"}
            subtext={pendingCount > 0 ? "Local records waiting to sync" : "All records up to date"}
            onClick={() => onNavigate('sync')}
          />
        </div>

        {/* Quick Actions Bar */}
        <div className="card" style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #ffffff 0%, #f7f9f7 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-900)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Field Quick Actions
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              One-touch field data logging
            </span>
          </div>
          <div className="quick-actions-bar">
            <button
              className="btn btn-primary"
              onClick={() => setAddVillageOpen(true)}
              id="qa-btn-add-village"
            >
              <Plus size={16} /> Add Village
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setRegisterFarmerOpen(true)}
              id="qa-btn-register-farmer"
            >
              <Plus size={16} /> Register Farmer
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setNewAssessmentOpen(true)}
              id="qa-btn-new-assessment"
            >
              <Plus size={16} /> New Assessment
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setCandidateOpen(true)}
              id="qa-btn-register-candidate"
            >
              <Award size={16} color="var(--terracotta)" /> Register VLE Candidate
            </button>
          </div>
        </div>

        {/* 2-Column Section: Recent Villages & Recent Field Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 20 }}>
          {/* Left Column: Assigned Villages */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="card-header" style={{ padding: '16px 20px', margin: 0 }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                  Assigned Villages
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Field operational coverage in your block
                </p>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => onNavigate('villages')}
              >
                View All <ChevronRight size={13} />
              </button>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Village</th>
                    <th>Block</th>
                    <th>Farmers</th>
                    <th>Stage</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {villages.slice(0, 5).map(v => (
                    <tr key={v._id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary-900)' }}>
                        {v.name}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {v.block}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{v.farmerCount || 0}</span>
                      </td>
                      <td>
                        <StatusBadge status={v.readinessStage} type="stage" />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                          onClick={() => setSelectedVillage(v)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Recent Field Activity */}
          <div className="card">
            <div className="card-header" style={{ margin: 0, paddingBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                  Recent Field Activity
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Chronological activity timeline
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
              {recentActivities.map(act => {
                const Icon = act.icon;
                return (
                  <div
                    key={act.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      paddingBottom: 12,
                      borderBottom: '1px solid var(--earth-warm)'
                    }}
                  >
                    <div className={`stat-icon ${act.color}`} style={{ width: 36, height: 36 }}>
                      <Icon size={18} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {act.title}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {act.time}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-800)', marginTop: 2 }}>
                        {act.target}
                      </span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {act.meta}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
