import { AlertTriangle, RefreshCw } from 'lucide-react';

const ERROR_MESSAGES = {
  401: { title: 'Session Expired', hint: 'Your login session has expired. Please log in again.' },
  403: { title: 'Access Denied', hint: 'You do not have permission to view this resource.' },
  404: { title: 'Not Found', hint: 'The requested data could not be found.' },
  409: { title: 'Conflict', hint: 'This record already exists.' },
  500: { title: 'Server Error', hint: 'Something went wrong on our server. Please try again shortly.' },
  0: { title: 'Connection Error', hint: 'Could not reach the server. Check your network or try again.' },
};

// Accepts either an `error` object (VLE pages, which surface HTTP status
// codes from the API client) or a `message` (Volunteer pages, which pass a
// plain string or a generic Error). Either prop name works so callers on
// both sides can use whichever reads naturally for them.
export function ErrorState({ error, message, onRetry }) {
  const err = error ?? message;
  const status = err?.status;
  const info = ERROR_MESSAGES[status] || {
    title: 'Unable to Load Data',
    hint: typeof err === 'string' ? err : err?.message || 'Check your network connection or try again.'
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '56px 24px',
        gap: 14,
        textAlign: 'center',
        background: 'var(--danger-bg)',
        border: '1px solid var(--danger-border)',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
        <AlertTriangle size={28} />
      </div>
      <div>
        <p style={{ fontWeight: 700, color: 'var(--danger-text)', marginBottom: 6 }}>{info.title}</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--danger-text)', maxWidth: 420 }}>{info.hint}</p>
        {status ? <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 6 }}>HTTP {status}</p> : null}
      </div>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry} id="error-retry-btn" style={{ marginTop: 4 }}>
          <RefreshCw size={14} /> Try Again
        </button>
      )}
    </div>
  );
}
