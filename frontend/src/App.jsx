import { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { VolunteerAuthProvider } from './context/VolunteerAuthContext';
import { VolunteerOfflineProvider } from './context/VolunteerOfflineContext';
import { VolunteerLayout } from './components/layout/VolunteerLayout';

import { DashboardPage } from './pages/DashboardPage';
import { VillagesPage } from './pages/VillagesPage';
import { FarmersPage } from './pages/FarmersPage';
import { NeedsAssessmentPage } from './pages/NeedsAssessmentPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { OfflineSyncPage } from './pages/OfflineSyncPage';
import { ProfilePage } from './pages/ProfilePage';

import './App.css';

export function VolunteerApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveTab} />;
      case 'villages':
        return <VillagesPage />;
      case 'farmers':
        return <FarmersPage />;
      case 'assessments':
        return <NeedsAssessmentPage />;
      case 'candidates':
        return <CandidatesPage />;
      case 'sync':
        return <OfflineSyncPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <VolunteerLayout activeTab={activeTab} onNavigate={setActiveTab}>
      {renderActivePage()}
    </VolunteerLayout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <VolunteerAuthProvider>
        <VolunteerOfflineProvider>
          <VolunteerApp />
        </VolunteerOfflineProvider>
      </VolunteerAuthProvider>
    </ToastProvider>
  );
}
