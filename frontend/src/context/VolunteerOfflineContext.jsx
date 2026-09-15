import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { volunteerService } from '../api/volunteerService';
import { useToast } from './ToastContext';

const VolunteerOfflineContext = createContext(null);

export function VolunteerOfflineProvider({ children }) {
  const { toast } = useToast();
  // Simulated toggleable online state (defaults to real navigator status)
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [queue, setQueue] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const refreshQueue = useCallback(() => {
    const q = volunteerService.getOfflineQueue();
    setQueue(q);
  }, []);

  useEffect(() => {
    refreshQueue();

    const handleOnline = () => {
      if (!simulatedOffline) {
        setIsOnline(true);
        toast('Network connectivity restored.', 'success');
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast('You are now working offline.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [simulatedOffline, toast, refreshQueue]);

  const toggleSimulatedOffline = () => {
    setSimulatedOffline(prev => {
      const next = !prev;
      setIsOnline(!next);
      if (next) {
        toast('Simulated Offline Mode enabled. New records will be stored locally with offlineId.', 'warning');
      } else {
        toast('Online Mode restored. Ready to sync records.', 'success');
      }
      return next;
    });
  };

  const syncNow = async () => {
    if (syncing) return;
    if (queue.length === 0) {
      toast('All records are already synchronized with central servers.', 'info');
      return;
    }

    setSyncing(true);
    setSyncProgress(15);
    try {
      const res = await volunteerService.syncBatch((progress) => {
        setSyncProgress(progress.progress);
      });
      refreshQueue();
      toast(res.message, 'success');
    } catch (err) {
      toast(err.message || 'Sync failed. Please try again.', 'error');
    } finally {
      setSyncing(false);
      setSyncProgress(0);
    }
  };

  return (
    <VolunteerOfflineContext.Provider
      value={{
        isOnline,
        simulatedOffline,
        toggleSimulatedOffline,
        pendingCount: queue.length,
        queue,
        refreshQueue,
        syncing,
        syncProgress,
        syncNow
      }}
    >
      {children}
    </VolunteerOfflineContext.Provider>
  );
}

export function useVolunteerOffline() {
  const ctx = useContext(VolunteerOfflineContext);
  if (!ctx) throw new Error('useVolunteerOffline must be used within VolunteerOfflineProvider');
  return ctx;
}
