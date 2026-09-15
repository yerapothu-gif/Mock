import { createContext, useContext, useState, useEffect } from 'react';
import { vleService } from '../api/vleService';

const AuthContext = createContext(null);

// Demo VLE user — used when login page is removed
const DEMO_USER = {
  _id: 'demo-vle-001',
  name: 'Ramesh Patel',
  phone: '9826012345',
  role: 'vle',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEMO_USER);
  const [vleProfile, setVleProfile] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedReason, setLockedReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [authError] = useState(null);

  useEffect(() => {
    // Auto-load VLE profile on mount (no login required)
    vleService.getProfile()
      .then(profile => {
        setVleProfile(profile);
        setIsLocked(profile?.accountStatus === 'locked');
      })
      .catch(err => {
        if (err?.status === 403) {
          setIsLocked(true);
          setLockedReason(err.message || 'Training incomplete. Account is locked.');
        } else {
          console.warn('VLE profile fetch issue:', err);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const logout = () => {
    // No-op without login — resets to demo user
    setUser(DEMO_USER);
    setVleProfile(null);
    setIsLocked(false);
    setLockedReason('');
  };

  const toggleAccountLock = (locked) => {
    vleService.setAccountLockStatus(locked);
    setIsLocked(locked);
    if (locked) {
      setLockedReason('Training incomplete. Account is locked.');
    } else {
      setLockedReason('');
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await vleService.getProfile();
      setVleProfile(profile);
      setIsLocked(profile?.accountStatus === 'locked');
    } catch (err) {
      if (err.status === 403) {
        setIsLocked(true);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        vleProfile,
        isLocked,
        lockedReason,
        isLoading,
        authError,
        isAuthenticated: !!user,
        isVle: user?.role === 'vle',
        logout,
        refreshProfile,
        toggleAccountLock
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
