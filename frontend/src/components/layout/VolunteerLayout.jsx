import { useVolunteerAuth } from '../../context/VolunteerAuthContext';
import { useVolunteerOffline } from '../../context/VolunteerOfflineContext';
import { OfflineBanner } from './OfflineBanner';
import {
  LayoutDashboard,
  MapPin,
  Users,
  ClipboardList,
  Award,
  RefreshCw,
  UserCheck,
  Sprout,
  Wifi,
  WifiOff
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'villages', label: 'Villages', icon: MapPin },
  { id: 'farmers', label: 'Farmers', icon: Users },
  { id: 'assessments', label: 'Needs Assessment', icon: ClipboardList },
  { id: 'candidates', label: 'VLE Candidates', icon: Award },
  { id: 'sync', label: 'Offline / Sync', icon: RefreshCw, showBadge: true },
  { id: 'profile', label: 'Profile', icon: UserCheck }
];

export function VolunteerLayout({ activeTab, onNavigate, children }) {
  const { volunteer } = useVolunteerAuth();
  const { isOnline, pendingCount, toggleSimulatedOffline, simulatedOffline } = useVolunteerOffline();

  const getInitials = (name) => {
    if (!name) return 'VR';
    const parts = name.split(' ');
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="app-shell">
      {/* Sidebar for Desktop */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Sprout size={22} />
          </div>
          <div className="sidebar-brand-text">
            <h1>Reaching Roots</h1>
            <span>Field Volunteer</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
                id={`nav-item-${item.id}`}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.showBadge && pendingCount > 0 && (
                  <span className="nav-badge">{pendingCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div
            className="volunteer-profile-chip"
            onClick={() => onNavigate('profile')}
            style={{ cursor: 'pointer' }}
          >
            <div className="volunteer-avatar">
              {getInitials(volunteer?.name)}
            </div>
            <div className="volunteer-info">
              <span className="volunteer-name">{volunteer?.name || 'Field Volunteer'}</span>
              <span className="volunteer-role">
                {volunteer?.district ? `${volunteer.district} District` : 'Field Officer'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="app-main">
        {/* Top Header */}
        <header className="app-header">
          <div className="header-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="sidebar-brand-icon" style={{ width: 32, height: 32, display: 'none' }}>
                <Sprout size={18} />
              </div>
              <h2 className="header-title">
                {NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Volunteer Portal'}
              </h2>
            </div>
          </div>

          <div className="header-right">
            {/* Connection Toggle & Status */}
            <button
              onClick={toggleSimulatedOffline}
              className={`connection-pill ${isOnline ? 'online' : 'offline'}`}
              title="Click to toggle offline simulation for testing"
              id="btn-connection-toggle"
            >
              {isOnline ? (
                <>
                  <span className="pulse-dot" />
                  <Wifi size={14} />
                  <span>Online {simulatedOffline ? '(Live)' : ''}</span>
                </>
              ) : (
                <>
                  <WifiOff size={14} />
                  <span>Offline (Simulated)</span>
                </>
              )}
            </button>

            {/* Pending Records Chip */}
            {pendingCount > 0 && (
              <button
                onClick={() => onNavigate('sync')}
                className="btn btn-secondary btn-sm"
                style={{
                  background: 'var(--amber-bg)',
                  borderColor: 'var(--amber-border)',
                  color: 'var(--amber-text)',
                  fontSize: '0.78rem',
                  gap: 6
                }}
                id="btn-header-sync"
              >
                <RefreshCw size={13} />
                <span>{pendingCount} Pending Sync</span>
              </button>
            )}
          </div>
        </header>

        {/* Offline Warning Banner */}
        <OfflineBanner />

        {/* Page Body */}
        {children}

        {/* Mobile Bottom Navigation */}
        <nav className="mobile-bottom-nav">
          {NAV_ITEMS.slice(0, 5).map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                id={`mobile-nav-${item.id}`}
              >
                <Icon size={18} />
                <span>{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
          <button
            onClick={() => onNavigate('sync')}
            className={`mobile-nav-item ${activeTab === 'sync' ? 'active' : ''}`}
            id="mobile-nav-sync"
          >
            <div style={{ position: 'relative' }}>
              <RefreshCw size={18} />
              {pendingCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    background: 'var(--amber)',
                    color: '#fff',
                    fontSize: '0.62rem',
                    borderRadius: '50%',
                    width: 14,
                    height: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}
                >
                  {pendingCount}
                </span>
              )}
            </div>
            <span>Sync</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
