import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'No data yet', description = '', action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 14, textAlign: 'center' }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--earth-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <Inbox size={28} />
      </div>
      <div>
        <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{title}</p>
        {description && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: 340 }}>{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
