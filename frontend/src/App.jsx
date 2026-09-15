import { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import { VLELayout } from './components/layout/VLELayout';
import DashboardPage from './pages/DashboardPage';
import EquipmentPage from './pages/EquipmentPage';
import TransactionsPage from './pages/TransactionsPage';
import SupportPage from './pages/SupportPage';
import ProfilePage from './pages/ProfilePage';
import './index.css';

function VLEApp() {
  const { isLoading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--primary-900)'
      }}>
        <div style={{ textAlign: 'center', color: '#52b788' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🌱</div>
          <p style={{ color: '#c9d6cf', fontSize: '0.9rem', fontWeight: 600 }}>
            Loading Reaching Roots VLE Portal...
          </p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <DashboardPage onNavigate={setActivePage} />;
      case 'equipment':    return <EquipmentPage />;
      case 'transactions': return <TransactionsPage />;
      case 'support':      return <SupportPage />;
      case 'profile':      return <ProfilePage />;
      default:             return <DashboardPage onNavigate={setActivePage} />;
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
