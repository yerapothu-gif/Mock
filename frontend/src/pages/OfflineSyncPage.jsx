import { useVolunteerOffline } from '../context/VolunteerOfflineContext';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  RefreshCw,
  Wifi,
  WifiOff,
  CloudUpload,
  Clock,
  CheckCircle2,
  Database,
  MapPin,
  Users,
  ClipboardList
} from 'lucide-react';

export function OfflineSyncPage() {
  const {
    isOnline,
    simulatedOffline,
    toggleSimulatedOffline,
    pendingCount,
    queue,
    syncing,
    syncProgress,
    syncNow
  } = useVolunteerOffline();

  const getEntityIcon = (type) => {
    switch (type) {
      case 'village': return <MapPin size={18} color="var(--terracotta)" />;
      case 'farmer': return <Users size={18} color="var(--primary-700)" />;
      case 'assessment': return <ClipboardList size={18} color="var(--blue)" />;
      default: return <Database size={18} color="var(--text-muted)" />;
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Offline Synchronization Engine</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 3 }}>
            Review pending field submissions and sync batch records via <code>POST /api/sync/batch</code>.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={syncNow}
          disabled={syncing || pendingCount === 0}
          id="btn-sync-now"
          style={{ minWidth: 140 }}
        >
          <RefreshCw size={16} className={syncing ? 'spin' : ''} />
          {syncing ? `Syncing (${syncProgress}%)...` : `Sync Now (${pendingCount})`}
        </button>
      </div>

      {/* Network Connectivity Panel */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: isOnline ? 'var(--success-bg)' : 'var(--danger-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${isOnline ? 'var(--success-border)' : 'var(--danger-border)'}`
            }}
          >
            {isOnline ? <Wifi size={24} color="var(--success)" /> : <WifiOff size={24} color="var(--danger)" />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isOnline ? '🟢 Connected / Online' : '🔴 Disconnected / Offline'}
              </h3>
              {simulatedOffline && (
                <span style={{ fontSize: '0.74rem', background: 'var(--amber-bg)', color: 'var(--amber-text)', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                  Simulated Mode Active
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {isOnline
                ? 'Ready to upload queued field records to Reaching Roots servers.'
                : 'All village, farmer, and assessment creations are safely saved to device storage.'}
            </p>
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={toggleSimulatedOffline}
          id="btn-toggle-offline-simulation"
        >
          {simulatedOffline ? 'Switch to Live Online Mode' : 'Simulate Low Connectivity / Offline'}
        </button>
      </div>

      {/* Sync Progress Indicator */}
      {syncing && (
        <div className="card" style={{ padding: 18, border: '1.5px solid var(--primary-500)', background: 'var(--primary-50)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-900)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={15} className="spin" /> Executing Idempotent Batch Sync...
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-800)' }}>
              {syncProgress}%
            </span>
          </div>
          <div style={{ width: '100%', height: 8, background: '#ffffff', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                width: `${syncProgress}%`,
                height: '100%',
                background: 'var(--primary-600)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Processing offline IDs via <code>findOneAndUpdate({`{ offlineId }`}, update, {`{ upsert: true }`})</code>
          </p>
        </div>
      )}

      {/* Pending Records Queue Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-900)' }}>
              Pending Synchronization Queue
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {pendingCount === 0
                ? 'All field records have been synchronized with the cloud.'
                : `${pendingCount} record${pendingCount === 1 ? '' : 's'} awaiting server push.`}
            </p>
          </div>
        </div>

        {queue.length === 0 ? (
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 24px',
              textAlign: 'center',
              gap: 10
            }}
          >
            <CheckCircle2 size={40} color="var(--success)" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success-text)' }}>
              Everything Is Synchronized
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: 400 }}>
              Any village or farmer records you create while in the field will appear here until connectivity is restored.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {queue.map((item, idx) => (
              <div
                key={item.offlineId || idx}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderLeft: '4px solid var(--amber)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--earth-warm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {getEntityIcon(item.entityType)}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        {item.entityType}
                      </span>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.name || item.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 3, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Offline ID: <code style={{ fontFamily: 'var(--font-mono)' }}>{item.offlineId}</code></span>
                      <span>•</span>
                      <span>Recorded: {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <StatusBadge status={item.status || 'pending'} type="sync" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Technical Spec Box */}
      <div className="card" style={{ background: 'var(--earth-warm)', border: '1px solid var(--earth-border)', padding: 16 }}>
        <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--primary-900)', marginBottom: 6 }}>
          API Specification Reference
        </h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Per <code>API_DOCUMENTATION.md §3.4</code>, <code>POST /api/sync/batch</code> accepts arrays of <code>villages</code>, <code>farmers</code>, <code>assessments</code>, and <code>transactions</code>, using <code>offlineId</code> for idempotent upserts.
        </p>
      </div>
    </div>
  );
}
