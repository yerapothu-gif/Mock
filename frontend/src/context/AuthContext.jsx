import { createContext, useContext, useState, useEffect } from 'react';
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

  const loadVleProfile = async () => {
    try {
      const profile = await vleService.getProfile();
      setVleProfile(profile);
      setIsLocked(profile?.accountStatus === 'locked');
    } catch (err) {
      if (err?.status === 403) {
        setIsLocked(true);
        setLockedReason(err.message || 'Training incomplete. Account is locked.');
      } else {
        console.warn('VLE profile fetch issue:', err);
      }
    }
  };

  useEffect(() => {
    // Resume an existing session (e.g. after a page refresh) if a token is stored
    const bootstrap = async () => {
      if (getAccessToken()) {
        try {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            if (currentUser.role === 'vle') {
              await loadVleProfile();
            }
          }
        } catch {
          // Stale or invalid token — treat as logged out
        }
      }
      setIsLoading(false);
    };
    bootstrap();
  }, []);

  const login = async (phone, password) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const res = await authService.login(phone, password);
      const loggedInUser = res?.user || res?.data?.user || res?.data;
      setUser(loggedInUser);
      if (loggedInUser?.role === 'vle') {
        await loadVleProfile();
      }
      return loggedInUser;
    } catch (err) {
      setAuthError(err?.message || 'Login failed. Check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, phone, password, role) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      return await authService.register(name, phone, password, role);
    } catch (err) {
      setAuthError(err?.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setVleProfile(null);
    setIsLocked(false);
    setLockedReason('');
  };

  const toggleAccountLock = (locked) => {
    vleService.setAccountLockStatus(locked);
    setIsLocked(locked);
    setLockedReason(locked ? 'Training incomplete. Account is locked.' : '');
  };

  const refreshProfile = async () => {
    await loadVleProfile();
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
        isVolunteer: user?.role === 'volunteer',
        login,
        register,
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
