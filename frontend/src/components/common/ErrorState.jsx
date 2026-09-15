import { AlertTriangle, RefreshCw } from 'lucide-react';

const ERROR_MESSAGES = {
  401: { title: 'Session Expired', hint: 'Your login session has expired. Please log in again.' },
  403: { title: 'Access Denied', hint: 'You do not have permission to view this resource.' },
  404: { title: 'Not Found', hint: 'The requested data could not be found.' },
  409: { title: 'Conflict', hint: 'This record already exists.' },
  500: { title: 'Server Error', hint: 'Something went wrong on our server. Please try again shortly.' },
  0: { title: 'Connection Error', hint: 'Could not reach the server. Check your network or try again.' },
};

export function ErrorState({ error, onRetry }) {
  const status = error?.status;
  const info = ERROR_MESSAGES[status] || { title: 'Error', hint: error?.message || 'An unexpected error occurred.' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 14, textAlign: 'center' }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
        <AlertTriangle size={28} />
      </div>
      <div>
        <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{info.title}</p>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: 380 }}>{info.hint}</p>
        {status && <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 6 }}>HTTP {status}</p>}
      </div>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry} id="error-retry-btn">
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}
