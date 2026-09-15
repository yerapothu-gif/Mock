import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { syncService } from '../api/syncService';
import { useToast } from './ToastContext';

const OfflineContext = createContext(null);

export function OfflineProvider({ children }) {
  const [browserOnline, setBrowserOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const isEffectiveOnline = browserOnline && !simulatedOffline;

  const refreshPendingCount = useCallback(() => {
    const queue = syncService.getQueuedTransactions();
    setPendingCount(queue.length);
  }, []);

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = () => {
      setBrowserOnline(true);
      toast('Network connection restored. You are ONLINE.', 'info');
    };

    const handleOffline = () => {
      setBrowserOnline(false);
      toast('Network connection lost. Operating in OFFLINE mode.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshPendingCount, toast]);

  const syncNow = async () => {
    if (!isEffectiveOnline) {
      toast('Cannot sync while offline. Please connect to a network first.', 'warning');
      return;
    }

    setIsSyncing(true);
    try {
      const res = await syncService.syncBatch();
      refreshPendingCount();
      if (res?.syncedCount > 0) {
        toast(`Synced ${res.syncedCount} offline transaction(s) to server!`, 'success');
      } else {
        toast('All transactions are already synchronized.', 'info');
      }
      return res;
    } catch (err) {
      toast(`Sync failed: ${err.message}`, 'error');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleSimulateOffline = () => {
    setSimulatedOffline((prev) => {
      const next = !prev;
      if (next) {
        toast('Simulated Offline Mode enabled. Transactions will be queued locally with offlineId.', 'warning');
      } else {
        toast('Simulated Offline Mode disabled. Back online.', 'info');
      }
      return next;
    });
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline: isEffectiveOnline,
        browserOnline,
        simulatedOffline,
        pendingCount,
        isSyncing,
        syncNow,
        refreshPendingCount,
        toggleSimulateOffline
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within OfflineProvider');
  return ctx;
};
