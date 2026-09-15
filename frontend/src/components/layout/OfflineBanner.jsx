import { useVolunteerOffline } from '../../context/VolunteerOfflineContext';
import { WifiOff, RefreshCw } from 'lucide-react';

export function OfflineBanner() {
  const { isOnline, simulatedOffline, pendingCount, syncNow, syncing } = useVolunteerOffline();

  if (isOnline && !simulatedOffline && pendingCount === 0) return null;

  return (
    <div className="offline-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}>
        <WifiOff size={16} />
        <span>
          {!isOnline
            ? `Offline mode active — records will be queued locally with offlineId.`
            : `${pendingCount} record${pendingCount === 1 ? '' : 's'} waiting to sync with central database.`}
        </span>
      </div>
      {isOnline && pendingCount > 0 && (
        <button
          onClick={syncNow}
          disabled={syncing}
          className="btn btn-secondary btn-sm"
          style={{ padding: '3px 10px', fontSize: '0.76rem', background: '#ffffff', color: 'var(--amber-text)', border: '1px solid var(--amber-border)' }}
        >
          <RefreshCw size={12} className={syncing ? 'spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      )}
    </div>
  );
}
