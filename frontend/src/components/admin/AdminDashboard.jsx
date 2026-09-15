import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import adminDataService from '../../services/adminDataService';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard({ onExitToLanding }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onExitToLanding?.();
  };

  // Navigation: All 8 core requested modules in structured vertical navbar
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'synced-data' | 'vle' | 'machinery' | 'rentals' | 'ai-reports' | 'farmer-requests' | 'support'
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Core Datasets
  const [villages, setVillages] = useState([]);
  const [vles, setVles] = useState([]);
  const [rentalLogs, setRentalLogs] = useState([]);
  const [farmerRequests, setFarmerRequests] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [aiReports, setAiReports] = useState([]);

  // Modals & Drawers
  const [selectedVillageDetails, setSelectedVillageDetails] = useState(null);
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [newVleData, setNewVleData] = useState({ name: '', contactInfo: '', villageId: '', villageName: '' });

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedVleForAssign, setSelectedVleForAssign] = useState(null);
  const [assignMachineType, setAssignMachineType] = useState('Seed Drill (Multi-crop)');
  const [assignMachineId, setAssignMachineId] = useState('');

  const [supportReplyModalOpen, setSupportReplyModalOpen] = useState(false);
  const [selectedSupportTicket, setSelectedSupportTicket] = useState(null);
  const [supportReplyText, setSupportReplyText] = useState('');

  // Filters
  const [villageFilter, setVillageFilter] = useState('all'); // 'all' | 'pending' | 'confirmed'
  const [requestFilter, setRequestFilter] = useState('open'); // 'open' | 'all' | 'fulfilled'
  const [supportFilter, setSupportFilter] = useState('all'); // 'all' | 'open' | 'resolved'

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      // AI Demand Reports calls the backend's OpenAI-backed endpoint, which can take
      // many seconds (or longer, with no API credits) to fail and fall back. Load it
      // independently below so a slow/failing AI call never blocks the rest of the
      // dashboard, which only needs fast, local MongoDB-backed data.
      const [vData, vleData, rLogs, fReqs, sReqs] = await Promise.all([
        adminDataService.getVillages(),
        adminDataService.getVLEs(),
        adminDataService.getRentalLogs(),
        adminDataService.getFarmerRequests(),
        adminDataService.getSupportRequests(),
      ]);
      setVillages(vData);
      setVles(vleData);
      setRentalLogs(rLogs);
      setFarmerRequests(fReqs);
      setSupportRequests(sReqs);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAIReports = async () => {
    try {
      const aiRep = await adminDataService.getAIReports();
      setAiReports(aiRep);
    } catch (err) {
      console.error('Failed to load AI demand reports', err);
    }
  };

  useEffect(() => {
    loadAllData();
    loadAIReports();
  }, []);

  // Action 1: Confirm Viable Village
  const handleConfirmViable = async (villageId, villageName) => {
    try {
      const updated = await adminDataService.confirmViableVillage(villageId);
      setVillages(updated);
      showNotification(`Village "${villageName}" confirmed viable. Readiness upgraded to Assessed.`);
      if (selectedVillageDetails?._id === villageId) {
        setSelectedVillageDetails(updated.find((v) => v._id === villageId));
      }
    } catch (err) {
      showNotification(err?.message || 'Failed to confirm village as viable.', 'error');
    }
  };

  // Action 2: Onboard VLE Candidate
  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!newVleData.name || !newVleData.villageName) return;
    try {
      const updated = await adminDataService.onboardVLE(newVleData);
      setVles(updated);
      setOnboardModalOpen(false);
      setNewVleData({ name: '', contactInfo: '', villageId: '', villageName: '' });
      showNotification(`Candidate "${newVleData.name}" successfully onboarded as VLE for ${newVleData.villageName}.`);
    } catch (err) {
      showNotification(err?.message || 'Failed to onboard VLE candidate.', 'error');
    }
  };

  // Quick Promote Candidate from Synced Farmers
  const handlePromoteCandidate = (farmer, village) => {
    setNewVleData({
      name: farmer.name,
      contactInfo: farmer.contactInfo,
      villageId: village._id,
      villageName: village.name,
    });
    setOnboardModalOpen(true);
    setActiveTab('vle');
  };

  // Action 3: Assign Machinery (Strictly Foundation Ownership)
  const handleAssignEquipment = async (e) => {
    e.preventDefault();
    if (!selectedVleForAssign) return;
    const mId = assignMachineId || `RRF-EQ-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      const updated = await adminDataService.assignEquipment(selectedVleForAssign._id, {
        machineType: assignMachineType,
        machineId: mId,
      });
      setVles(updated);
      setAssignModalOpen(false);
      setSelectedVleForAssign(null);
      setAssignMachineId('');
      showNotification(`Assigned ${assignMachineType} (${mId}) to VLE. Ownership tagged strictly as "Foundation".`);
    } catch (err) {
      showNotification(err?.message || 'Failed to assign equipment.', 'error');
    }
  };

  // Action 4: Mark Training Complete (Unlocks VLE Account Access)
  const handleMarkTrainingComplete = async (vleId, vleName) => {
    try {
      const updated = await adminDataService.markTrainingComplete(vleId);
      setVles(updated);
      showNotification(`VLE Training verified for ${vleName}. Account status unlocked to ACTIVE.`);
    } catch (err) {
      showNotification(err?.message || 'Failed to mark training complete.', 'error');
    }
  };

  // Action 5: Fulfill Open Farmer Request
  const handleFulfillRequest = async (reqId, farmerName, machineType) => {
    try {
      const updatedVillages = await adminDataService.fulfillFarmerRequest(reqId);
      setVillages(updatedVillages);
      const updatedReqs = await adminDataService.getFarmerRequests();
      setFarmerRequests(updatedReqs);
      showNotification(`Fulfilled request for ${farmerName} (${machineType}). Subsidized machine allocated.`);
    } catch (err) {
      showNotification(err?.message || 'Failed to fulfill farmer request.', 'error');
    }
  };

  // Action 6: Respond to VLE Support / Contact Ticket
  const handleRespondSupport = async (e) => {
    e.preventDefault();
    if (!selectedSupportTicket || !supportReplyText) return;
    try {
      const updated = await adminDataService.respondToSupportRequest(selectedSupportTicket._id, supportReplyText);
      setSupportRequests(updated);
      setSupportReplyModalOpen(false);
      setSelectedSupportTicket(null);
      setSupportReplyText('');
      showNotification('Response dispatched to VLE and ticket marked as Resolved.');
    } catch (err) {
      showNotification(err?.message || 'Failed to send response.', 'error');
    }
  };

  // Aggregate Metrics
  const confirmedVillagesCount = villages.filter((v) => v.viableStatus === 'confirmed').length;
  const pendingVillagesCount = villages.filter((v) => v.viableStatus === 'pending').length;
  const activeVlesCount = vles.filter((v) => v.accountStatus === 'active').length;
  const totalFarmersCount = villages.reduce((acc, v) => acc + (v.farmerCount || 0), 0);
  const openFarmerRequestsCount = farmerRequests.filter((r) => r.status === 'open').length;
  const openSupportTicketsCount = supportRequests.filter((s) => s.status === 'open').length;

  // Clean, Minimalist Navigation Items (No Emojis, No Numbering, No Circular Badge Boxes)
  const NAV_ITEMS = [
    {
      id: 'queue',
      label: 'Village Queue',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'synced-data',
      label: 'Field Surveys',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      id: 'vle',
      label: 'VLE Onboarding',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      ),
    },
    {
      id: 'machinery',
      label: 'Machinery & Fleet',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
    {
      id: 'rentals',
      label: 'Rental Logs',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      id: 'ai-reports',
      label: 'AI Demand Reports',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
    {
      id: 'farmer-requests',
      label: 'Farmer Requests',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
      ),
    },
    {
      id: 'support',
      label: 'Support Desk',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FA', color: 'var(--brand-charcoal)', fontFamily: 'var(--font-body)' }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: notification.type === 'success' ? 'var(--brand-green)' : 'var(--brand-orange)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '4px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.9rem',
            fontWeight: 600,
            animation: 'slideUp 0.3s ease',
          }}
        >
          <span>✓</span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CLEAN VERTICAL NAVBAR (LEFT SIDEBAR) */}
      {/* ========================================================================= */}
      <aside
        style={{
          width: '250px',
          minWidth: '250px',
          backgroundColor: 'var(--brand-charcoal)',
          color: '#ffffff',
          height: '100vh',
          position: 'sticky',
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Clean Header: Logo Only */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <img
            src="/images/logo.png"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://framerusercontent.com/images/cN8Y0VLU8UWjo1mrNrSz9L1IuWU.png';
            }}
            alt="Reaching Roots"
            style={{ height: '32px', filter: 'brightness(0) invert(1)' }}
          />
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'rgba(255, 255, 255, 0.45)',
              textTransform: 'uppercase',
            }}
          >
            ADMIN
          </span>
        </div>

        {/* Clean Navigation Links - Pure Icon & Text */}
        <nav
          style={{
            flex: 1,
            padding: '16px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            overflowY: 'auto',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  borderLeft: isActive ? '3px solid var(--brand-orange)' : '3px solid transparent',
                  backgroundColor: isActive ? 'rgba(4, 114, 77, 0.25)' : 'transparent',
                  color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  }
                }}
              >
                <span style={{ color: isActive ? 'var(--brand-orange)' : 'rgba(255, 255, 255, 0.55)', display: 'flex' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Clean Minimal Footer */}
        <div
          style={{
            padding: '16px 18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* User Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-green)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.78rem',
              }}
            >
              SA
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{user?.name || 'Admin'}</span>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} title="Online / Rollback Safe-Mode Active" />
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                Field Ops Director
              </div>
            </div>
          </div>

          {/* Exit / Sign Out Links */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onExitToLanding}
              style={{
                flex: 1,
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '3px',
                padding: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.75rem',
                fontWeight: 600,
                fontFamily: 'var(--font-heading)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
              }}
            >
              <span>← Exit to Site</span>
            </button>
            <button
              onClick={handleLogout}
              id="logout-btn"
              title="Sign out and switch accounts"
              style={{
                background: 'transparent',
                border: '1px solid rgba(252, 165, 165, 0.3)',
                borderRadius: '3px',
                padding: '8px',
                color: '#fca5a5',
                fontSize: '0.75rem',
                fontWeight: 600,
                fontFamily: 'var(--font-heading)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(252, 165, 165, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(252, 165, 165, 0.3)';
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA (RIGHT SIDE) */}
      {/* ========================================================================= */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Top Content Bar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--brand-border)',
            padding: '16px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--brand-green)', fontWeight: 800, letterSpacing: '0.06em' }}>
              NGO STAFF PORTAL • BHOPAL RURAL DISTRICT
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '2px 0 0', color: 'var(--brand-charcoal)' }}>
              {NAV_ITEMS.find((i) => i.id === activeTab)?.label || 'Console'}
            </h2>
          </div>

          {/* Top Quick Status Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--brand-charcoal-muted)' }}>
              Last Volunteer Sync: <strong>Today, 10:30 AM</strong>
            </div>
            <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--brand-border)' }} />
            <span
              style={{
                backgroundColor: 'var(--brand-green-subtle)',
                color: 'var(--brand-green-dark)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              5 Active Clusters
            </span>
          </div>
        </div>

        {/* Global KPI Summary Bar */}
        <section
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--brand-border)',
            padding: '16px 32px',
          }}
        >
          <div
            style={{
              maxWidth: '1400px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '16px',
            }}
          >
            {/* KPI 1 */}
            <div style={{ padding: '10px 14px', borderLeft: '3px solid var(--brand-green)', backgroundColor: 'var(--brand-bg)' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--brand-charcoal-muted)', fontWeight: 700 }}>
                Viable Villages Confirmed
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-green-dark)', marginTop: '2px' }}>
                {confirmedVillagesCount}{' '}
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--brand-charcoal-muted)' }}>
                  / {villages.length} total
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: pendingVillagesCount > 0 ? 'var(--brand-orange)' : 'var(--brand-green)', marginTop: '2px' }}>
                {pendingVillagesCount} pending viability confirmation
              </div>
            </div>

            {/* KPI 2 */}
            <div style={{ padding: '10px 14px', borderLeft: '3px solid var(--brand-orange)', backgroundColor: 'var(--brand-bg)' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--brand-charcoal-muted)', fontWeight: 700 }}>
                Active VLE Entrepreneurs
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-charcoal)', marginTop: '2px' }}>
                {activeVlesCount}{' '}
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--brand-charcoal-muted)' }}>
                  / {vles.length} enrolled
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--brand-charcoal-muted)', marginTop: '2px' }}>
                Ownership Tagged: "Foundation"
              </div>
            </div>

            {/* KPI 3 */}
            <div style={{ padding: '10px 14px', borderLeft: '3px solid #3B82F6', backgroundColor: 'var(--brand-bg)' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--brand-charcoal-muted)', fontWeight: 700 }}>
                Farmers Synced (Field Volunteers)
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-charcoal)', marginTop: '2px' }}>
                {totalFarmersCount.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--brand-charcoal-muted)', marginTop: '2px' }}>
                Across 5 Ratapani clusters
              </div>
            </div>

            {/* KPI 4 */}
            <div style={{ padding: '10px 14px', borderLeft: '3px solid #EF4444', backgroundColor: 'var(--brand-bg)' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--brand-charcoal-muted)', fontWeight: 700 }}>
                Open Farmer Requests
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EF4444', marginTop: '2px' }}>
                {openFarmerRequestsCount}{' '}
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--brand-charcoal-muted)' }}>
                  unfulfilled
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--brand-charcoal-muted)', marginTop: '2px' }}>
                {openSupportTicketsCount} open VLE support tickets
              </div>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div style={{ padding: '28px 32px', maxWidth: '1400px', width: '100%', margin: '0 auto', flex: 1 }}>

          {/* ========================================================================= */}
          {/* MODULE 1: Village Identification Queue & Confirm Viable Villages */}
          {/* ========================================================================= */}
          {activeTab === 'queue' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--brand-charcoal)' }}>
                    Village Identification Queue & Viability Confirmation
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--brand-charcoal-muted)', margin: 0 }}>
                    Review surveyed villages synced from the field. Assess demographic viability, natural water reservoirs, and confirm viable villages for VLE machinery placement.
                  </p>
                </div>

                {/* Status Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-charcoal-muted)' }}>Viability Filter:</span>
                  <div style={{ display: 'flex', backgroundColor: '#ffffff', border: '1px solid var(--brand-border)', borderRadius: '4px', padding: '2px' }}>
                    {['all', 'pending', 'confirmed'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setVillageFilter(f)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          border: 'none',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          backgroundColor: villageFilter === f ? 'var(--brand-green)' : 'transparent',
                          color: villageFilter === f ? '#ffffff' : 'var(--brand-charcoal)',
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Queue Table */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--brand-border)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--brand-bg)', borderBottom: '1px solid var(--brand-border)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--brand-charcoal-muted)' }}>
                        <th style={{ padding: '14px 18px' }}>Village Name & Water Body</th>
                        <th style={{ padding: '14px 18px' }}>Synced By Volunteer</th>
                        <th style={{ padding: '14px 18px' }}>Farmers / Acreage</th>
                        <th style={{ padding: '14px 18px' }}>Crops Grown</th>
                        <th style={{ padding: '14px 18px' }}>Readiness Stage</th>
                        <th style={{ padding: '14px 18px' }}>Viable Status</th>
                        <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {villages
                        .filter((v) => {
                          if (villageFilter === 'all') return true;
                          return v.viableStatus === villageFilter;
                        })
                        .map((v) => {
                          const isConfirmed = v.viableStatus === 'confirmed';
                          return (
                            <tr
                              key={v._id}
                              style={{ borderBottom: '1px solid var(--brand-border)', transition: 'background-color 0.15s' }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--brand-bg)')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              <td style={{ padding: '16px 18px' }}>
                                <div style={{ fontWeight: 700, color: 'var(--brand-charcoal)', fontSize: '0.95rem' }}>{v.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--brand-charcoal-muted)' }}>
                                  Water: {v.waterResources || 'Seasonal Nallah'}
                                </div>
                              </td>
                              <td style={{ padding: '16px 18px' }}>
                                <div style={{ fontWeight: 600 }}>{v.volunteerName || 'Field Volunteer'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--brand-charcoal-muted)' }}>
                                  {v.syncedAt ? new Date(v.syncedAt).toLocaleDateString() : 'Recent'}
                                </div>
                              </td>
                              <td style={{ padding: '16px 18px' }}>
                                <div style={{ fontWeight: 700 }}>{v.farmerCount} Farmers</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--brand-charcoal-muted)' }}>{v.acres} Acres</div>
                              </td>
                              <td style={{ padding: '16px 18px' }}>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {(v.majorCrops || []).map((crop) => (
                                    <span
                                      key={crop}
                                      style={{
                                        padding: '2px 6px',
                                        backgroundColor: 'var(--brand-green-subtle)',
                                        color: 'var(--brand-green-dark)',
                                        fontSize: '0.72rem',
                                        borderRadius: '2px',
                                        fontWeight: 600,
                                      }}
                                    >
                                      {crop}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td style={{ padding: '16px 18px' }}>
                                <span
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '3px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    backgroundColor: v.readinessStage === 'vle-active' ? 'var(--brand-green-subtle)' : '#FEF3C7',
                                    color: v.readinessStage === 'vle-active' ? 'var(--brand-green-dark)' : '#B45309',
                                  }}
                                >
                                  {v.readinessStage}
                                </span>
                              </td>
                              <td style={{ padding: '16px 18px' }}>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    backgroundColor: isConfirmed ? '#DCFCE7' : '#FEE2E2',
                                    color: isConfirmed ? '#166534' : '#991B1B',
                                  }}
                                >
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isConfirmed ? '#166534' : '#991B1B' }} />
                                  {isConfirmed ? 'CONFIRMED VIABLE' : 'PENDING REVIEW'}
                                </span>
                              </td>
                              <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                  <button
                                    onClick={() => setSelectedVillageDetails(v)}
                                    className="btn btn-outline"
                                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                                  >
                                    Inspect Data
                                  </button>
                                  {!isConfirmed && (
                                    <button
                                      onClick={() => handleConfirmViable(v._id, v.name)}
                                      className="btn btn-primary"
                                      style={{
                                        padding: '6px 12px',
                                        fontSize: '0.78rem',
                                        backgroundColor: 'var(--brand-green)',
                                      }}
                                    >
                                      Confirm Viable
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODULE 2: Synced Field Volunteer Data */}
          {/* ========================================================================= */}
          {activeTab === 'synced-data' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--brand-charcoal)' }}>
                    Synced Field Volunteer Datasets & Needs Assessments
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--brand-charcoal-muted)', margin: 0 }}>
                    Detailed breakdown of synchronized field surveys including registered farmers, crop acreage, water reservoirs, and farming stage evaluations.
                  </p>
                </div>

                <div style={{ padding: '6px 14px', backgroundColor: 'var(--brand-green-subtle)', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--brand-green-dark)', fontWeight: 700 }}>
                  📶 Direct Volunteer Sync Channel Active
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
                {villages.map((v) => (
                  <div
                    key={v._id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '4px',
                      border: '1px solid var(--brand-border)',
                      padding: '24px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          SYNCED VILLAGE CLUSTER
                        </div>
                        <h4 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '2px 0 4px', color: 'var(--brand-charcoal)' }}>
                          {v.name}
                        </h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--brand-charcoal-muted)' }}>
                          Synced by Volunteer <strong>{v.volunteerName || 'Field Team'}</strong> • {v.farmerCount} Farmers • {v.acres} Acres
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedVillageDetails(v)}
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        View Full Roster ↗
                      </button>
                    </div>

                    {/* Farm Stage Assessment Evaluation */}
                    <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-charcoal-muted)', marginBottom: '8px' }}>
                        Farm Stage Evaluations:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {(v.needsAssessment?.processesEvaluated || []).slice(0, 4).map((p, idx) => (
                          <div key={idx} style={{ padding: '8px 10px', backgroundColor: 'var(--brand-bg)', borderRadius: '3px', border: '1px solid var(--brand-border)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-green-dark)' }}>{p.stage}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--brand-charcoal-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                              {p.notes}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Identified Gaps */}
                    <div style={{ padding: '10px 12px', backgroundColor: 'var(--brand-orange-subtle)', borderRadius: '3px', borderLeft: '3px solid var(--brand-orange)', fontSize: '0.8rem' }}>
                      <strong>Equipment Gaps:</strong> {(v.needsAssessment?.gapsIdentified || []).join(' • ') || 'Seed Drill, Power Weeder'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODULE 3: VLE Candidates & Onboarding */}
          {/* ========================================================================= */}
          {activeTab === 'vle' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--brand-charcoal)' }}>
                    Potential VLE Identification & Candidate Onboarding
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--brand-charcoal-muted)', margin: 0 }}>
                    Screen local farmers flagged for entrepreneurship skills (tractor driving license, SHG leadership) and onboard them into the foundation network.
                  </p>
                </div>

                <button
                  onClick={() => setOnboardModalOpen(true)}
                  className="btn btn-primary"
                  style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                >
                  + Onboard New VLE Candidate
                </button>
              </div>

              {/* Candidate Sourcing from Synced Data */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand-charcoal)', marginBottom: '10px' }}>
                  🔍 Potential Candidates Flagged from Volunteer Sync:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {villages
                    .flatMap((v) => (v.farmers || []).filter((f) => f.potentialVle).map((f) => ({ ...f, villageName: v.name, villageId: v._id })))
                    .map((candidate, idx) => (
                      <div key={idx} style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '4px', border: '1px solid var(--brand-border)', borderLeft: '4px solid var(--brand-orange)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--brand-charcoal)' }}>{candidate.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--brand-charcoal-muted)' }}>
                              {candidate.villageName} • {candidate.contactInfo}
                            </div>
                          </div>
                          <span style={{ padding: '3px 8px', backgroundColor: 'var(--brand-orange-subtle)', color: 'var(--brand-orange)', fontSize: '0.72rem', fontWeight: 700, borderRadius: '3px' }}>
                            RECOMMENDED
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--brand-charcoal-muted)', margin: '8px 0 12px' }}>
                          Field Notes: {candidate.notes}
                        </div>
                        <button
                          onClick={() => {
                            setNewVleData({
                              name: candidate.name,
                              contactInfo: candidate.contactInfo,
                              villageId: candidate.villageId,
                              villageName: candidate.villageName,
                            });
                            setOnboardModalOpen(true);
                          }}
                          className="btn btn-primary"
                          style={{ width: '100%', padding: '8px', fontSize: '0.78rem', justifyContent: 'center' }}
                        >
                          Onboard {candidate.name} as VLE →
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              {/* Currently Onboarded VLE Roster */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--brand-border)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--brand-border)', fontWeight: 700 }}>
                  Enrolled VLE Entrepreneur Directory
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--brand-bg)', borderBottom: '1px solid var(--brand-border)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em', color: 'var(--brand-charcoal-muted)' }}>
                        <th style={{ padding: '12px 16px' }}>VLE Name</th>
                        <th style={{ padding: '12px 16px' }}>Assigned Village</th>
                        <th style={{ padding: '12px 16px' }}>Assigned Machinery</th>
                        <th style={{ padding: '12px 16px' }}>Training</th>
                        <th style={{ padding: '12px 16px' }}>Account Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vles.map((vle) => (
                        <tr key={vle._id} style={{ borderBottom: '1px solid var(--brand-border)' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 700 }}>{vle.name}</td>
                          <td style={{ padding: '14px 16px' }}>{vle.villageName}</td>
                          <td style={{ padding: '14px 16px' }}>
                            {(vle.assignedEquipment || []).length > 0 ? (
                              <span style={{ color: 'var(--brand-green-dark)', fontWeight: 600 }}>
                                {vle.assignedEquipment.map((e) => e.machineType).join(', ')}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--brand-charcoal-muted)', fontStyle: 'italic' }}>Pending Assignment</span>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '3px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: vle.trainingCompleted ? '#DCFCE7' : '#FEF3C7',
                                color: vle.trainingCompleted ? '#166534' : '#B45309',
                              }}
                            >
                              {vle.trainingCompleted ? 'Complete' : 'In Training'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '3px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                backgroundColor: vle.accountStatus === 'active' ? 'var(--brand-green-subtle)' : '#FEE2E2',
                                color: vle.accountStatus === 'active' ? 'var(--brand-green-dark)' : '#991B1B',
                              }}
                            >
                              {vle.accountStatus === 'active' ? 'Active' : 'Locked'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODULE 4: Machinery Assignment (Foundation Ownership) & Training Verification */}
          {/* ========================================================================= */}
          {activeTab === 'machinery' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--brand-charcoal)' }}>
                    Machinery Allocation & Training Verification Hub
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--brand-charcoal-muted)', margin: 0 }}>
                    Assign subsidized equipment with ownership permanently registered as <strong>"Foundation"</strong>, and mark training as complete to unlock VLE account access.
                  </p>
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--brand-border)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--brand-bg)', borderBottom: '1px solid var(--brand-border)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--brand-charcoal-muted)' }}>
                        <th style={{ padding: '14px 18px' }}>VLE Entrepreneur</th>
                        <th style={{ padding: '14px 18px' }}>Village Hub</th>
                        <th style={{ padding: '14px 18px' }}>Assigned Machinery (Foundation Tagged)</th>
                        <th style={{ padding: '14px 18px' }}>Training Verification</th>
                        <th style={{ padding: '14px 18px' }}>Account Status</th>
                        <th style={{ padding: '14px 18px', textAlign: 'right' }}>Management Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vles.map((vle) => {
                        const isTrained = vle.trainingCompleted;
                        const isActive = vle.accountStatus === 'active';
                        const equipmentList = vle.assignedEquipment || [];

                        return (
                          <tr key={vle._id} style={{ borderBottom: '1px solid var(--brand-border)' }}>
                            <td style={{ padding: '16px 18px' }}>
                              <div style={{ fontWeight: 700, color: 'var(--brand-charcoal)' }}>{vle.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--brand-charcoal-muted)' }}>{vle.contactInfo}</div>
                            </td>
                            <td style={{ padding: '16px 18px' }}>
                              <div style={{ fontWeight: 600 }}>{vle.villageName}</div>
                            </td>
                            <td style={{ padding: '16px 18px' }}>
                              {equipmentList.length === 0 ? (
                                <span style={{ fontSize: '0.8rem', color: 'var(--brand-charcoal-muted)', fontStyle: 'italic' }}>
                                  No machinery assigned
                                </span>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {equipmentList.map((eq, i) => (
                                    <div
                                      key={i}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '3px 8px',
                                        backgroundColor: 'var(--brand-green-subtle)',
                                        borderRadius: '3px',
                                        fontSize: '0.75rem',
                                      }}
                                    >
                                      <strong style={{ color: 'var(--brand-green-dark)' }}>{eq.machineType}</strong>
                                      <span style={{ color: 'var(--brand-charcoal-muted)' }}>({eq.machineId})</span>
                                      <span
                                        style={{
                                          backgroundColor: '#1E293B',
                                          color: '#ffffff',
                                          padding: '1px 5px',
                                          borderRadius: '2px',
                                          fontSize: '0.68rem',
                                          fontWeight: 700,
                                        }}
                                      >
                                        OWNER: {eq.ownership || 'Foundation'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '16px 18px' }}>
                              <span
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '3px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  backgroundColor: isTrained ? '#DCFCE7' : '#FEF3C7',
                                  color: isTrained ? '#166534' : '#B45309',
                                }}
                              >
                                {isTrained ? '✓ Training Verified' : 'Training Pending'}
                              </span>
                            </td>
                            <td style={{ padding: '16px 18px' }}>
                              <span
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '3px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  backgroundColor: isActive ? 'var(--brand-green-subtle)' : '#FEE2E2',
                                  color: isActive ? 'var(--brand-green-dark)' : '#991B1B',
                                }}
                              >
                                {isActive ? 'Active (Unlocked)' : 'Locked'}
                              </span>
                            </td>
                            <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                <button
                                  onClick={() => {
                                    setSelectedVleForAssign(vle);
                                    setAssignModalOpen(true);
                                  }}
                                  className="btn btn-outline"
                                  style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                                >
                                  + Assign Equipment
                                </button>

                                {!isTrained && (
                                  <button
                                    onClick={() => handleMarkTrainingComplete(vle._id, vle.name)}
                                    className="btn btn-primary"
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '0.78rem',
                                      backgroundColor: 'var(--brand-orange)',
                                    }}
                                    title="Unlocks VLE account access"
                                  >
                                    Mark Training Complete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODULE 5: VLE Rental Logs & Performance */}
          {/* ========================================================================= */}
          {activeTab === 'rentals' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--brand-charcoal)' }}>
                    VLE Rental Logs & Fleet Performance
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--brand-charcoal-muted)', margin: 0 }}>
                    Review rental operations logged by VLEs, track hours operated, acres serviced, and revenue generated from subsidized machinery.
                  </p>
                </div>
              </div>

              {/* Performance KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '4px', border: '1px solid var(--brand-border)' }}>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--brand-charcoal-muted)', fontWeight: 700 }}>
                    Total Rental Hours
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand-green)', marginTop: '4px' }}>
                    {rentalLogs.reduce((sum, r) => sum + (r.hoursUsed || 0), 0)} hrs
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--brand-charcoal-muted)', marginTop: '4px' }}>Across all foundation equipment</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '4px', border: '1px solid var(--brand-border)' }}>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--brand-charcoal-muted)', fontWeight: 700 }}>
                    Total Farmland Serviced
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand-charcoal)', marginTop: '4px' }}>
                    {rentalLogs.reduce((sum, r) => sum + (r.acresCovered || 0), 0).toFixed(1)} acres
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--brand-charcoal-muted)', marginTop: '4px' }}>In indigenous cropping clusters</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '4px', border: '1px solid var(--brand-border)' }}>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--brand-charcoal-muted)', fontWeight: 700 }}>
                    Subsidized Rental Revenue
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand-orange)', marginTop: '4px' }}>
                    ₹{rentalLogs.reduce((sum, r) => sum + (r.rentalFee || 0), 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--brand-charcoal-muted)', marginTop: '4px' }}>Reinvested in hub maintenance</div>
                </div>
              </div>

              {/* Rental Transaction Log Table */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--brand-border)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--brand-border)', fontWeight: 700 }}>
                  Verified Rental Transactions
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--brand-bg)', borderBottom: '1px solid var(--brand-border)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em', color: 'var(--brand-charcoal-muted)' }}>
                        <th style={{ padding: '12px 16px' }}>Txn ID & Date</th>
                        <th style={{ padding: '12px 16px' }}>VLE Operator</th>
                        <th style={{ padding: '12px 16px' }}>Farmer Beneficiary</th>
                        <th style={{ padding: '12px 16px' }}>Equipment Used</th>
                        <th style={{ padding: '12px 16px' }}>Usage / Acreage</th>
                        <th style={{ padding: '12px 16px' }}>Fee Paid</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rentalLogs.map((log) => (
                        <tr key={log._id} style={{ borderBottom: '1px solid var(--brand-border)' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--brand-charcoal)' }}>{log.transactionId}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--brand-charcoal-muted)' }}>{log.date}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 600 }}>{log.vleName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--brand-charcoal-muted)' }}>{log.villageName}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 600 }}>{log.farmerName}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--brand-green-dark)' }}>{log.machineType}</span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div>{log.hoursUsed} hrs</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--brand-charcoal-muted)' }}>{log.acresCovered} acres</div>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--brand-charcoal)' }}>
                            ₹{log.rentalFee}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '3px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                backgroundColor: log.status === 'completed' ? '#DCFCE7' : '#FEF3C7',
                                color: log.status === 'completed' ? '#166534' : '#B45309',
                              }}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODULE 6: AI-Generated Machinery-Need Reports */}
          {/* ========================================================================= */}
          {activeTab === 'ai-reports' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--brand-charcoal)' }}>
                    AI-Generated Machinery-Need Reports
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--brand-charcoal-muted)', margin: 0 }}>
                    Automated aggregation of synced farmer needs assessments, crop cycles, and machinery deficits across all villages.
                  </p>
                </div>
                <div style={{ padding: '6px 14px', backgroundColor: 'var(--brand-green-subtle)', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--brand-green-dark)', fontWeight: 700 }}>
                  ✨ Powered by AgroDemand AI Engine
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                {aiReports.map((report) => (
                  <div
                    key={report._id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '4px',
                      border: '1px solid var(--brand-border)',
                      padding: '24px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-orange)', letterSpacing: '0.06em' }}>
                          AGGREGATED DEMAND SUMMARY PER VILLAGE
                        </span>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 0', color: 'var(--brand-charcoal)' }}>
                          {report.villageName}
                        </h4>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--brand-charcoal-muted)' }}>Deficit Score</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: report.deficitScore > 75 ? '#EF4444' : 'var(--brand-orange)' }}>
                          {report.deficitScore} / 100
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '12px', backgroundColor: 'var(--brand-bg)', borderRadius: '4px', marginBottom: '16px', fontSize: '0.88rem', color: 'var(--brand-charcoal)', lineHeight: 1.5 }}>
                      "{report.aiSummary}"
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-charcoal-muted)', marginBottom: '6px' }}>
                        High-Priority Equipment Demands:
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {(report.highDemandMachines || []).map((m) => (
                          <span
                            key={m}
                            style={{
                              padding: '4px 10px',
                              backgroundColor: 'var(--brand-orange-subtle)',
                              color: 'var(--brand-orange)',
                              fontWeight: 700,
                              borderRadius: '3px',
                              fontSize: '0.78rem',
                            }}
                          >
                            ⚡ {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--brand-border)', paddingTop: '14px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-green-dark)', marginBottom: '6px' }}>
                        Recommended NGO Deployments:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--brand-charcoal)', lineHeight: 1.6 }}>
                        {(report.recommendedActions || []).map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODULE 7: Open & Unfulfilled Farmer Requests */}
          {/* ========================================================================= */}
          {activeTab === 'farmer-requests' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--brand-charcoal)' }}>
                    Open & Unfulfilled Farmer Requests
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--brand-charcoal-muted)', margin: 0 }}>
                    Consolidated feed of individual farmer machinery requirements gathered during volunteer field surveys and direct submissions.
                  </p>
                </div>

                {/* Status Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-charcoal-muted)' }}>Status Filter:</span>
                  <div style={{ display: 'flex', backgroundColor: '#ffffff', border: '1px solid var(--brand-border)', borderRadius: '4px', padding: '2px' }}>
                    {['open', 'all', 'fulfilled'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setRequestFilter(f)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          border: 'none',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          backgroundColor: requestFilter === f ? 'var(--brand-green)' : 'transparent',
                          color: requestFilter === f ? '#ffffff' : 'var(--brand-charcoal)',
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Farmer Requests Table */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--brand-border)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--brand-bg)', borderBottom: '1px solid var(--brand-border)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--brand-charcoal-muted)' }}>
                        <th style={{ padding: '14px 18px' }}>Farmer Name</th>
                        <th style={{ padding: '14px 18px' }}>Village</th>
                        <th style={{ padding: '14px 18px' }}>Requested Machine</th>
                        <th style={{ padding: '14px 18px' }}>Urgency</th>
                        <th style={{ padding: '14px 18px' }}>Farmer Notes</th>
                        <th style={{ padding: '14px 18px' }}>Status</th>
                        <th style={{ padding: '14px 18px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {farmerRequests
                        .filter((req) => {
                          if (requestFilter === 'all') return true;
                          return req.status === requestFilter;
                        })
                        .map((req) => {
                          const isOpen = req.status === 'open';
                          return (
                            <tr key={req._id} style={{ borderBottom: '1px solid var(--brand-border)' }}>
                              <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--brand-charcoal)' }}>
                                {req.farmerName}
                              </td>
                              <td style={{ padding: '14px 18px' }}>{req.villageName}</td>
                              <td style={{ padding: '14px 18px' }}>
                                <span style={{ fontWeight: 600, color: 'var(--brand-green-dark)' }}>{req.requestType}</span>
                              </td>
                              <td style={{ padding: '14px 18px' }}>
                                <span
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: '3px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    backgroundColor: req.urgency === 'High' ? '#FEE2E2' : '#FEF3C7',
                                    color: req.urgency === 'High' ? '#991B1B' : '#B45309',
                                  }}
                                >
                                  {req.urgency}
                                </span>
                              </td>
                              <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--brand-charcoal-muted)' }}>
                                {req.notes || '—'}
                              </td>
                              <td style={{ padding: '14px 18px' }}>
                                <span
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: '3px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    backgroundColor: isOpen ? '#FEF3C7' : '#DCFCE7',
                                    color: isOpen ? '#B45309' : '#166534',
                                  }}
                                >
                                  {req.status}
                                </span>
                              </td>
                              <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                                {isOpen ? (
                                  <button
                                    onClick={() => handleFulfillRequest(req._id, req.farmerName, req.requestType)}
                                    className="btn btn-primary"
                                    style={{ padding: '6px 12px', fontSize: '0.78rem', backgroundColor: 'var(--brand-green)' }}
                                  >
                                    Fulfill & Allocate Machine
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>✓ Dispatched</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODULE 8: VLE Support Desk & Feedback Management */}
          {/* ========================================================================= */}
          {activeTab === 'support' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--brand-charcoal)' }}>
                    VLE Support Desk & Feedback Management
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--brand-charcoal-muted)', margin: 0 }}>
                    Review contact requests from VLEs, issue directives for spare parts and machinery allocation, and address field feedback.
                  </p>
                </div>

                {/* Status Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-charcoal-muted)' }}>Ticket Status:</span>
                  <div style={{ display: 'flex', backgroundColor: '#ffffff', border: '1px solid var(--brand-border)', borderRadius: '4px', padding: '2px' }}>
                    {['all', 'open', 'resolved'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setSupportFilter(f)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          border: 'none',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          backgroundColor: supportFilter === f ? 'var(--brand-green)' : 'transparent',
                          color: supportFilter === f ? '#ffffff' : 'var(--brand-charcoal)',
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Support Tickets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {supportRequests
                  .filter((ticket) => {
                    if (supportFilter === 'all') return true;
                    return ticket.status === supportFilter;
                  })
                  .map((ticket) => {
                    const isOpen = ticket.status === 'open';
                    return (
                      <div
                        key={ticket._id}
                        style={{
                          backgroundColor: '#ffffff',
                          padding: '20px 24px',
                          borderRadius: '4px',
                          border: '1px solid var(--brand-border)',
                          borderLeft: isOpen ? '4px solid var(--brand-orange)' : '4px solid var(--brand-green)',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '2px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  backgroundColor: 'var(--brand-bg)',
                                  color: 'var(--brand-charcoal)',
                                }}
                              >
                                {ticket.category}
                              </span>
                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '2px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  backgroundColor: isOpen ? '#FEF3C7' : '#DCFCE7',
                                  color: isOpen ? '#B45309' : '#166534',
                                }}
                              >
                                {ticket.status}
                              </span>
                            </div>
                            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '6px 0 2px', color: 'var(--brand-charcoal)' }}>
                              {ticket.subject}
                            </h4>
                            <div style={{ fontSize: '0.8rem', color: 'var(--brand-charcoal-muted)' }}>
                              Submitted by <strong>{ticket.vleName}</strong> ({ticket.villageName}) • {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Today'}
                            </div>
                          </div>

                          {isOpen ? (
                            <button
                              onClick={() => {
                                setSelectedSupportTicket(ticket);
                                setSupportReplyModalOpen(true);
                              }}
                              className="btn btn-primary"
                              style={{ padding: '8px 16px', fontSize: '0.8rem', backgroundColor: 'var(--brand-orange)' }}
                            >
                              Respond to VLE →
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 600 }}>✓ Resolved</span>
                          )}
                        </div>

                        <div style={{ padding: '12px 16px', backgroundColor: 'var(--brand-bg)', borderRadius: '4px', fontSize: '0.88rem', color: 'var(--brand-charcoal)', lineHeight: 1.5, marginBottom: '12px' }}>
                          "{ticket.message}"
                        </div>

                        {ticket.adminResponse && (
                          <div style={{ padding: '12px 16px', backgroundColor: 'var(--brand-green-subtle)', borderRadius: '4px', borderLeft: '3px solid var(--brand-green)', fontSize: '0.85rem', color: 'var(--brand-green-dark)' }}>
                            <strong>Admin Response:</strong> {ticket.adminResponse}
                            <div style={{ fontSize: '0.72rem', color: 'var(--brand-charcoal-muted)', marginTop: '4px' }}>
                              Dispatched on {ticket.respondedAt ? new Date(ticket.respondedAt).toLocaleDateString() : 'Recently'}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODALS & DRAWERS */}
      {/* ========================================================================= */}

      {/* Synced Village Data Details Modal */}
      {selectedVillageDetails && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(28,28,28,0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 2100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setSelectedVillageDetails(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              width: '100%',
              maxWidth: '900px',
              maxHeight: '88vh',
              overflowY: 'auto',
              borderRadius: '4px',
              padding: '32px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--brand-border)', paddingBottom: '18px', marginBottom: '22px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--brand-green)', fontWeight: 700, letterSpacing: '0.06em' }}>
                  SYNCED FIELD ASSESSMENT RECORD
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '4px 0 6px', color: 'var(--brand-charcoal)' }}>
                  {selectedVillageDetails.name}
                </h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--brand-charcoal-muted)' }}>
                  Synced by Volunteer <strong>{selectedVillageDetails.volunteerName}</strong> • {selectedVillageDetails.farmerCount} Registered Farmers • {selectedVillageDetails.acres} Acres
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedVillageDetails.viableStatus !== 'confirmed' && (
                  <button
                    onClick={() => handleConfirmViable(selectedVillageDetails._id, selectedVillageDetails.name)}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    Confirm as Viable Village
                  </button>
                )}
                <button
                  onClick={() => setSelectedVillageDetails(null)}
                  style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--brand-charcoal-muted)' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Farm Stage Gaps */}
            <div style={{ marginBottom: '28px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-charcoal)', marginBottom: '12px' }}>
                Needs Assessment & Farm Stage Gaps
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                {(selectedVillageDetails.needsAssessment?.processesEvaluated || []).map((p, idx) => (
                  <div key={idx} style={{ padding: '12px', backgroundColor: 'var(--brand-bg)', borderRadius: '4px', border: '1px solid var(--brand-border)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-green-dark)' }}>{p.stage}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--brand-charcoal-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                      {p.notes}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '10px 14px', backgroundColor: 'var(--brand-orange-subtle)', borderRadius: '4px', borderLeft: '3px solid var(--brand-orange)', fontSize: '0.85rem' }}>
                <strong>Identified Machinery Gaps:</strong> {(selectedVillageDetails.needsAssessment?.gapsIdentified || []).join(' • ')}
              </div>
            </div>

            {/* Synced Farmer Roster & Potential VLE Identification */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-charcoal)', margin: 0 }}>
                  Synced Farmers & Potential VLE Candidates
                </h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--brand-charcoal-muted)' }}>
                  Flagged candidates have leadership and driving qualifications
                </span>
              </div>

              <div style={{ border: '1px solid var(--brand-border)', borderRadius: '4px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead style={{ backgroundColor: 'var(--brand-bg)', borderBottom: '1px solid var(--brand-border)' }}>
                    <tr>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>Farmer Name</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>Contact</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>Land (Acres)</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>Crops</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>Field Notes</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>VLE Candidate?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedVillageDetails.farmers || []).map((f) => (
                      <tr key={f._id} style={{ borderBottom: '1px solid var(--brand-border)' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{f.name}</td>
                        <td style={{ padding: '12px 14px', color: 'var(--brand-charcoal-muted)' }}>{f.contactInfo}</td>
                        <td style={{ padding: '12px 14px' }}>{f.landSize} ac</td>
                        <td style={{ padding: '12px 14px' }}>{(f.crops || []).join(', ')}</td>
                        <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'var(--brand-charcoal-muted)' }}>{f.notes}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          {f.potentialVle ? (
                            <button
                              onClick={() => {
                                setSelectedVillageDetails(null);
                                handlePromoteCandidate(f, selectedVillageDetails);
                              }}
                              style={{
                                padding: '4px 10px',
                                backgroundColor: 'var(--brand-orange)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '2px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Promote to VLE →
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--brand-charcoal-muted)' }}>Standard</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onboard VLE Candidate Modal */}
      {onboardModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(28,28,28,0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 2200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setOnboardModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              width: '100%',
              maxWidth: '520px',
              borderRadius: '4px',
              padding: '30px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px', color: 'var(--brand-charcoal)' }}>
              Create VLE Profile & Onboard Candidate
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--brand-charcoal-muted)', marginBottom: '20px' }}>
              Enroll the village entrepreneur into the foundation hub. Training modules and machinery will be assigned next.
            </p>

            <form onSubmit={handleOnboardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Candidate Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={newVleData.name}
                  onChange={(e) => setNewVleData({ ...newVleData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--brand-border)', borderRadius: '2px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Phone / Contact Info *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98261 11223"
                  value={newVleData.contactInfo}
                  onChange={(e) => setNewVleData({ ...newVleData, contactInfo: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--brand-border)', borderRadius: '2px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Target Village *
                </label>
                <select
                  required
                  value={newVleData.villageName}
                  onChange={(e) => {
                    const vName = e.target.value;
                    const matched = villages.find((v) => v.name === vName);
                    setNewVleData({
                      ...newVleData,
                      villageName: vName,
                      villageId: matched?._id || 'vlg_custom',
                    });
                  }}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--brand-border)', borderRadius: '2px' }}
                >
                  <option value="">Select Village...</option>
                  {villages.map((v) => (
                    <option key={v._id} value={v.name}>
                      {v.name} ({v.viableStatus})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setOnboardModalOpen(false)}
                  className="btn btn-outline"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px' }}>
                  Create & Onboard VLE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Machinery Modal (Strict Foundation Ownership) */}
      {assignModalOpen && selectedVleForAssign && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(28,28,28,0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 2200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setAssignModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              width: '100%',
              maxWidth: '520px',
              borderRadius: '4px',
              padding: '30px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px', color: 'var(--brand-charcoal)' }}>
              Assign Machinery to VLE
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--brand-charcoal-muted)', marginBottom: '16px' }}>
              Assigning equipment to <strong>{selectedVleForAssign.name}</strong> ({selectedVleForAssign.villageName}).
            </p>

            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--brand-green-subtle)',
                borderRadius: '4px',
                borderLeft: '3px solid var(--brand-green)',
                marginBottom: '18px',
                fontSize: '0.82rem',
              }}
            >
              🔒 <strong>Strict Governance Tag:</strong> As per Reaching Roots charter, equipment ownership is permanently registered as <strong>"Foundation"</strong>. VLE operates the hub for community rentals.
            </div>

            <form onSubmit={handleAssignEquipment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Machinery / Equipment Type *
                </label>
                <select
                  value={assignMachineType}
                  onChange={(e) => setAssignMachineType(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--brand-border)', borderRadius: '2px' }}
                >
                  <option value="Seed Drill (Multi-crop)">Seed Drill (Multi-crop)</option>
                  <option value="Power Weeder (Petrol 7HP)">Power Weeder (Petrol 7HP)</option>
                  <option value="Mini Tractor (24HP 4WD)">Mini Tractor (24HP 4WD)</option>
                  <option value="Multi-Crop Thresher">Multi-Crop Thresher</option>
                  <option value="Solar Water Pump Set (5HP)">Solar Water Pump Set (5HP)</option>
                  <option value="Grain Grader & Cleaner">Grain Grader & Cleaner</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Machinery Asset ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g. RRF-SD-2026-04"
                  value={assignMachineId}
                  onChange={(e) => setAssignMachineId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--brand-border)', borderRadius: '2px' }}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--brand-charcoal-muted)', marginTop: '4px' }}>
                  Leave blank to auto-generate unique foundation asset tag.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="btn btn-outline"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px' }}>
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Respond Modal */}
      {supportReplyModalOpen && selectedSupportTicket && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(28,28,28,0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 2200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSupportReplyModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              width: '100%',
              maxWidth: '560px',
              borderRadius: '4px',
              padding: '30px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px', color: 'var(--brand-charcoal)' }}>
              Respond to VLE Contact Request
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--brand-charcoal-muted)', marginBottom: '16px' }}>
              Responding to <strong>{selectedSupportTicket.vleName}</strong> regarding: <em>{selectedSupportTicket.subject}</em>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--brand-bg)', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem' }}>
              "{selectedSupportTicket.message}"
            </div>

            <form onSubmit={handleRespondSupport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Admin Directive / Dispatch Instructions *
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="e.g. Field technician dispatched with replacement blades. ETA tomorrow 10:00 AM."
                  value={supportReplyText}
                  onChange={(e) => setSupportReplyText(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--brand-border)', borderRadius: '2px', fontSize: '0.9rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSupportReplyModalOpen(false)}
                  className="btn btn-outline"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', backgroundColor: 'var(--brand-green)' }}>
                  Send Response & Resolve Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
