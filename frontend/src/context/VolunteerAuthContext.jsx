import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { volunteerService } from '../api/volunteerService';

const VolunteerAuthContext = createContext(null);

// Wraps the REAL authenticated user (from AuthContext / useAuth, backed by the
// real POST /api/auth/login + GET /api/auth/me session) with volunteer-only
// extras. It no longer independently loads a hardcoded mock profile — every
// volunteer now sees their own real identity (_id, name, phone, role, etc.),
// and every signed-in volunteer necessarily has role === 'volunteer' here
// because VolunteerAuthProvider is only mounted for that role (see App.jsx).
export function VolunteerAuthProvider({ children }) {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);

  // getProfile() re-fetches the user plus live-computed field stats
  // (villagesVisited/farmersRegistered/assessmentsCompleted/candidatesIdentified)
  // from real backend data — see volunteerService.getProfile for exactly which
  // fields can be scoped to this volunteer vs. the whole team, given what the
  // backend schema currently attributes.
  useEffect(() => {
    if (!user) return;
    volunteerService.getProfile()
      .then(profile => setStats(profile?.stats || null))
      .catch(err => console.error('Failed to load volunteer field stats:', err));
  }, [user]);

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const profile = await volunteerService.getProfile();
      setStats(profile?.stats || null);
    } catch (err) {
      console.error('Failed to load volunteer field stats:', err);
    }
  };

  const volunteer = user ? { ...user, stats: stats || undefined } : null;

  return (
    <VolunteerAuthContext.Provider
      value={{
        volunteer,
        loading: authLoading,
        refreshProfile
      }}
    >
      {children}
    </VolunteerAuthContext.Provider>
  );
}

export function useVolunteerAuth() {
  const ctx = useContext(VolunteerAuthContext);
  if (!ctx) throw new Error('useVolunteerAuth must be used within VolunteerAuthProvider');
  return ctx;
}
