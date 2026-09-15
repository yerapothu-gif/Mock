import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../api/authService';
import { vleService } from '../api/vleService';
import { getAccessToken } from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [vleProfile, setVleProfile] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedReason, setLockedReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        setVleProfile(null);
        setIsLoading(false);
        return;
      }

      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        setUser(null);
        setVleProfile(null);
        setIsLoading(false);
        return;
      }

      setUser(currentUser);

      // Verify VLE profile & training lock gate
      try {
        const profile = await vleService.getProfile();
        setVleProfile(profile);
        setIsLocked(profile?.accountStatus === 'locked');
      } catch (profileErr) {
        if (profileErr.status === 403) {
          setIsLocked(true);
          setLockedReason(profileErr.message || 'Training incomplete. Account is locked.');
        } else {
          console.warn('VLE profile fetch issue:', profileErr);
        }
      }
    } catch (err) {
      console.error('Auth verification error:', err);
      setAuthError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (phone, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await authService.login(phone, password);
      const loggedUser = res?.user;
      
      if (loggedUser && loggedUser.role !== 'vle') {
        await authService.logout();
        throw new Error(`Role mismatch: Account '${loggedUser.name}' has role '${loggedUser.role}'. Only VLE accounts can access this portal.`);
      }

      setUser(loggedUser);

      // Check VLE profile & lock status
      try {
        const profile = await vleService.getProfile();
        setVleProfile(profile);
        setIsLocked(profile?.accountStatus === 'locked');
      } catch (profileErr) {
        if (profileErr.status === 403) {
          setIsLocked(true);
          setLockedReason(profileErr.message || 'Training incomplete. Account is locked.');
        }
      }

      return res;
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setVleProfile(null);
      setIsLocked(false);
      setLockedReason('');
      setIsLoading(false);
    }
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
        login,
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
