import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading field records...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        gap: 12,
        color: 'var(--text-muted)'
      }}
    >
      <Loader2 size={32} className="spin" color="var(--primary-600)" />
      <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</p>
    </div>
  );
}
