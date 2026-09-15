import { createContext, useContext, useState, useEffect } from 'react';
import { volunteerService } from '../api/volunteerService';

const VolunteerAuthContext = createContext(null);

export function VolunteerAuthProvider({ children }) {
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Automatically load simulated field volunteer profile (no login required)
    volunteerService.getProfile()
      .then(profile => {
        setVolunteer(profile);
      })
      .catch(err => {
        console.error('Failed to load volunteer profile:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const refreshProfile = async () => {
    try {
      const profile = await volunteerService.getProfile();
      setVolunteer(profile);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <VolunteerAuthContext.Provider value={{ volunteer, loading, refreshProfile }}>
      {children}
    </VolunteerAuthContext.Provider>
  );
}

export function useVolunteerAuth() {
  const ctx = useContext(VolunteerAuthContext);
  if (!ctx) throw new Error('useVolunteerAuth must be used within VolunteerAuthProvider');
  return ctx;
}
