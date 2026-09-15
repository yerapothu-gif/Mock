import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 14 }}>
      <Loader2 size={32} className="spin" style={{ color: 'var(--primary-600)', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
