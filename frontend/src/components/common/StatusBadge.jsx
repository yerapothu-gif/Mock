import { CheckCircle2, Clock, Check, RefreshCw } from 'lucide-react';

// Two usage modes, both seen across the merged app:
//  - No `type`: a generic dot-badge for free-form statuses (payment status,
//    equipment condition, account status, ticket status, ...), with an
//    optional `label` override for display text.
//  - `type` set to 'stage' | 'sync' | 'landholding' | 'urgency': a
//    purpose-built badge with its own icon/color rules for that domain.
export function StatusBadge({ status, label, type }) {
  if (!status) return null;

  const s = String(status).toLowerCase();

  // Readiness stages (identified, assessed, vle-active)
  if (type === 'stage') {
    switch (s) {
      case 'identified':
        return (
          <span className="badge badge-identified">
            <Clock size={12} /> Identified
          </span>
        );
      case 'assessed':
        return (
          <span className="badge badge-assessed">
            <Check size={12} /> Assessed
          </span>
        );
      case 'vle-active':
        return (
          <span className="badge badge-vle-active">
            <CheckCircle2 size={12} /> VLE Active
          </span>
        );
      default:
        return <span className="badge">{status}</span>;
    }
  }

  // Sync statuses (synced, pending, syncing)
  if (type === 'sync') {
    switch (s) {
      case 'synced':
        return (
          <span className="badge badge-synced">
            <CheckCircle2 size={12} /> Synced
          </span>
        );
      case 'pending':
        return (
          <span className="badge badge-pending">
            <Clock size={12} /> Pending Sync
          </span>
        );
      case 'syncing':
        return (
          <span className="badge badge-syncing">
            <RefreshCw size={12} className="spin" /> Syncing...
          </span>
        );
      default:
        return <span className="badge">{status}</span>;
    }
  }

  // Landholding types (marginal, small, medium, large)
  if (type === 'landholding') {
    const colors = {
      marginal: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
      small: { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
      medium: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
      large: { bg: '#f3e8ff', text: '#7e22ce', border: '#e9d5ff' }
    };
    const c = colors[s] || { bg: '#f3f4f6', text: '#4b5563', border: '#e5e7eb' };
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 999,
          fontSize: '0.74rem',
          fontWeight: 600,
          textTransform: 'capitalize',
          backgroundColor: c.bg,
          color: c.text,
          border: `1px solid ${c.border}`
        }}
      >
        {status}
      </span>
    );
  }

  // Urgency badges (low, medium, high, critical)
  if (type === 'urgency') {
    const urgencyColors = {
      low: { bg: '#f3f4f6', text: '#4b5563' },
      medium: { bg: '#fef3c7', text: '#92400e' },
      high: { bg: '#fee2e2', text: '#b91c1c' },
      critical: { bg: '#991b1b', text: '#ffffff' }
    };
    const c = urgencyColors[s] || { bg: '#f3f4f6', text: '#4b5563' };
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          backgroundColor: c.bg,
          color: c.text
        }}
      >
        {status}
      </span>
    );
  }

  // Default: generic status dot badge (payment/account/equipment/ticket statuses)
  const displayLabel = label || s.replace(/_/g, ' ');
  return (
    <span className={`badge badge-${s}`}>
      <span className="badge-dot" style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
        display: 'inline-block'
      }}></span>
      {displayLabel}
    </span>
  );
}
