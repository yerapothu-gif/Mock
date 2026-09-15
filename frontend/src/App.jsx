import { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import { VLELayout } from './components/layout/VLELayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EquipmentPage from './pages/EquipmentPage';
import TransactionsPage from './pages/TransactionsPage';
import EarningsPage from './pages/EarningsPage';
import SupportPage from './pages/SupportPage';
import ProfilePage from './pages/ProfilePage';
import './index.css';

function VLEApp() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-900)' }}>
        <div style={{ textAlign: 'center', color: '#52b788' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🌱</div>
          <p style={{ color: '#c9d6cf', fontSize: '0.9rem', fontWeight: 600 }}>Loading Reaching Roots VLE Portal...</p>
        </div>
      </div>
    );
  }

  // Role guard — if authenticated but not VLE, show error
  if (isAuthenticated && user?.role !== 'vle') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🚫</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#991b1b', marginBottom: 10 }}>Access Denied</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
            Account <strong>{user?.name}</strong> (role: <code>{user?.role}</code>) cannot access the VLE portal.
            Only VLE accounts are permitted.
          </p>
          <button className="btn btn-danger-outline" onClick={() => { localStorage.clear(); window.location.reload(); }}>
            Sign Out & Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginPage />;

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage onNavigate={setActivePage} />;
      case 'equipment': return <EquipmentPage />;
      case 'transactions': return <TransactionsPage />;
      case 'earnings': return <EarningsPage />;
      case 'support': return <SupportPage />;
      case 'profile': return <ProfilePage />;
      default: return <DashboardPage onNavigate={setActivePage} />;
    }
  };

  return (
    <VLELayout activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </VLELayout>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <OfflineProvider>
          <VLEApp />
        </OfflineProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
