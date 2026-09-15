import { useState } from 'react';
import { LayoutDashboard, Cpu, FileText, TrendingUp, Headphones, User, LogOut, Leaf, X, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { useToast } from '../../context/ToastContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'equipment', label: 'My Equipment', icon: Cpu },
  { id: 'transactions', label: 'Rentals', icon: FileText },
  { id: 'earnings', label: 'Earnings', icon: TrendingUp },
  { id: 'support', label: 'Support', icon: Headphones },
  { id: 'profile', label: 'Profile', icon: User },
];

export function VLELayout({ children, activePage, onNavigate }) {
  const { user, logout } = useAuth();
  const { isOnline, simulatedOffline, pendingCount, syncNow, isSyncing, toggleSimulateOffline } = useOffline();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast('Logged out successfully.', 'info');
  };

  const navLinks = (
    <>
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`nav-item ${activePage === id ? 'active' : ''}`}
          onClick={() => { onNavigate(id); setSidebarOpen(false); }}
          id={`nav-${id}`}
        >
          <Icon size={18} />
          {label}
        </button>
      ))}
    </>
  );

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'VL';

  return (
    <div className="app-shell">
      {/* Mobile backdrop */}
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <nav className={`vle-sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="VLE Navigation">
        <div className="sidebar-brand">
          <div className="brand-icon-box">
            <Leaf size={20} />
          </div>
          <div className="brand-info">
            <h2>Reaching Roots</h2>
            <span>VLE Portal</span>
          </div>
        </div>

        <div className="sidebar-nav">{navLinks}</div>

        <div className="sidebar-footer">
          {/* Network Status Toggle */}
          <button
            className="nav-item"
            onClick={toggleSimulateOffline}
            style={{ fontSize: '0.78rem', gap: 8 }}
            title="Toggle simulated offline mode for testing"
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isOnline ? '#22c55e' : '#ef4444',
              display: 'inline-block', flexShrink: 0
            }}></span>
            {simulatedOffline ? 'SIMULATED OFFLINE' : isOnline ? 'ONLINE' : 'OFFLINE'}
            {pendingCount > 0 && (
              <span style={{ marginLeft: 'auto', background: '#d97706', color: '#fff', borderRadius: '9999px', fontSize: '0.7rem', padding: '1px 6px', fontWeight: 700 }}>
                {pendingCount}
              </span>
            )}
          </button>

          {pendingCount > 0 && isOnline && (
            <button className="nav-item" onClick={syncNow} disabled={isSyncing} style={{ fontSize: '0.78rem', color: '#52b788' }}>
              {isSyncing ? '⟳ Syncing...' : `⬆ Sync ${pendingCount} pending`}
            </button>
          )}

          <div className="vle-pill-profile">
            <div className="avatar-badge">{initials}</div>
            <div className="vle-pill-text">
              <div className="vle-pill-name">{user?.name || 'VLE User'}</div>
              <div className="vle-pill-role">Village Level Entrepreneur</div>
            </div>
          </div>

          <button className="nav-item" onClick={handleLogout} id="logout-btn" style={{ color: '#fca5a5' }}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="app-main">
        {/* Offline Banner */}
        {!isOnline && (
          <div className="offline-banner">
            <span>⚡ OFFLINE MODE — New rentals will be queued locally.</span>
            {pendingCount > 0 && <span>{pendingCount} pending sync</span>}
          </div>
        )}

        {/* Top Header */}
        <header className="vle-header">
          <div className="header-left">
            <button
              className="mobile-menu-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div className="header-title-group">
              <h1>{NAV_ITEMS.find(n => n.id === activePage)?.label || 'Dashboard'}</h1>
            </div>
          </div>
          <div className="header-right">
            <div className="avatar-badge" style={{ background: 'var(--primary-700)', width: 36, height: 36, fontSize: '0.85rem', cursor: 'pointer' }} onClick={() => onNavigate('profile')}>
              {initials}
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
