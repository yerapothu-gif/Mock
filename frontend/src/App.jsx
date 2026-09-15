import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import VolunteerDashboard from './components/VolunteerDashboard';
import AdminDashboard from './components/AdminDashboard';
import VLEDashboard from './components/VLEDashboard';
import { getStoredUser, clearAuthSession } from './api';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeRole, setActiveRole] = useState('volunteer'); // 'volunteer', 'admin', 'vle'
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notification, setNotification] = useState(null);

  // Initialize session
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
      if (user.role) {
        setActiveRole(user.role);
      }
    }

    const handleOnline = () => {
      setIsOnline(true);
      triggerNotification('Internet connection restored. Ready to sync.', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      triggerNotification('Offline mode detected. Changes will be saved locally.', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Notification helper
  const triggerNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Switch role handler (seamless role change for presentation)
  const handleSwitchRole = (role) => {
    setActiveRole(role);
    triggerNotification(`Switched view to ${role.toUpperCase()} workspace`, 'info');
  };

  // Auth Success
  const handleAuthSuccess = (user, role) => {
    setCurrentUser(user);
    setActiveRole(role);
    triggerNotification(`Welcome, ${user.name}! Signed in as ${role.toUpperCase()}.`, 'success');
  };

  // Logout
  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    triggerNotification('Signed out successfully', 'info');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification Banner */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          background: notification.type === 'error' ? '#1f1315' : '#091f13',
          border: `1px solid ${notification.type === 'error' ? '#fb7185' : '#22c55e'}`,
          borderRadius: 12,
          padding: '12px 18px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          maxWidth: 420,
          animation: 'modalIn 0.2s ease',
        }}>
          {notification.type === 'error' ? (
            <AlertCircle size={18} color="#fb7185" />
          ) : notification.type === 'success' ? (
            <CheckCircle2 size={18} color="#4ade80" />
          ) : (
            <Info size={18} color="#38bdf8" />
          )}
          <span style={{ fontSize: 13.5, color: '#f8fafc', fontWeight: 500, flex: 1 }}>
            {notification.message}
          </span>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        activeRole={activeRole}
        onSwitchRole={handleSwitchRole}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        isOnline={isOnline}
      />

      {/* Active Role Dashboard View */}
      <main style={{ flex: 1 }}>
        {activeRole === 'volunteer' && (
          <VolunteerDashboard
            currentUser={currentUser}
            onNotify={triggerNotification}
          />
        )}

        {activeRole === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            onNotify={triggerNotification}
          />
        )}

        {activeRole === 'vle' && (
          <VLEDashboard
            currentUser={currentUser}
            onNotify={triggerNotification}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(7, 9, 14, 0.95)',
        padding: '18px 24px',
        marginTop: 40,
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        maxWidth: 1400,
        marginInline: 'auto',
        width: '100%'
      }}>
        <div>
          Reaching Roots Foundation — Agricultural Mechanization & Rural Entrepreneurship System
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <span>Offline PWA Ready</span>
          <span>IndexedDB Cache</span>
          <span>OpenAI Telemetry</span>
          <span>GeoJSON 2dsphere</span>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        defaultRole={activeRole}
      />
    </div>
  );
}
