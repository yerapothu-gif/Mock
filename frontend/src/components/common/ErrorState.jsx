import { AlertCircle, RefreshCw } from 'lucide-react';

export function ErrorState({ message = 'An error occurred while loading data.', onRetry }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        background: 'var(--danger-bg)',
        border: '1px solid var(--danger-border)',
        borderRadius: 'var(--radius-lg)',
        gap: 12
      }}
    >
      <AlertCircle size={32} color="var(--danger)" />
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--danger-text)' }}>
        Unable to load field information
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--danger-text)', maxWidth: 460 }}>
        {typeof message === 'string' ? message : message?.message || 'Check network connection or try again.'}
      </p>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry} style={{ marginTop: 8 }}>
          <RefreshCw size={14} /> Try Again
        </button>
      )}
    </div>
  );
}
