import { useState, useEffect, useCallback } from 'react';
import { supportService } from '../api/supportService';
import { NewTicketModal } from '../components/support/NewTicketModal';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Plus, ChevronDown, ChevronUp, Pencil } from 'lucide-react';

const CATEGORY_LABELS = {
  equipment_request: 'Equipment Request',
  maintenance_issue: 'Maintenance Issue',
  farmer_feedback: 'Farmer Feedback',
  general_query: 'General Query'
};

const URGENCY_COLOR = { low: '#0369a1', medium: '#92400e', high: '#991b1b' };

function TicketCard({ ticket, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const isEquipmentRequest = ticket.category === 'equipment_request';
  // Only allow editing if ticket is still open (not resolved / responded)
  const canEdit = isEquipmentRequest && ticket.status !== 'resolved';

  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--earth-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-subtle)',
    }}>
      {/* Header row — always visible */}
      <div
        style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14 }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <StatusBadge status={ticket.status} />
            <span style={{
              fontSize: '0.75rem', background: 'var(--earth-warm)',
              padding: '2px 8px', borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)', fontWeight: 600
            }}>
              {CATEGORY_LABELS[ticket.category] || ticket.category}
            </span>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
              color: URGENCY_COLOR[ticket.urgency] || 'var(--text-muted)',
              letterSpacing: '0.04em'
            }}>
              {ticket.urgency} urgency
            </span>
          </div>
          <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{ticket.subject}</h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {ticket.createdAt
              ? new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : ''}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Edit button — only for equipment_request tickets that aren't resolved */}
          {canEdit && (
            <button
              className="btn btn-secondary btn-sm"
              id={`edit-ticket-${ticket._id}`}
              onClick={(e) => { e.stopPropagation(); onEdit(ticket); }}
              style={{ gap: 5 }}
              title="Edit this equipment request"
            >
              <Pencil size={13} /> Edit
            </button>
          )}
          {expanded
            ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} />
            : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: '14px 20px 20px', borderTop: '1px solid var(--earth-border-subtle)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {ticket.message}
          </p>

          {ticket.adminResponse && (
            <div style={{
              marginTop: 16, background: 'var(--primary-50)',
              border: '1px solid var(--primary-100)',
              borderRadius: 'var(--radius-md)', padding: '12px 16px'
            }}>
              <p style={{
                fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                color: 'var(--primary-700)', letterSpacing: '0.05em', marginBottom: 6
              }}>Admin Response</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {ticket.adminResponse}
              </p>
              {ticket.resolvedAt && (
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  Resolved: {new Date(ticket.resolvedAt).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
          )}

          {/* Info nudge for editable equipment requests */}
          {canEdit && (
            <div style={{
              marginTop: 14, fontSize: '0.78rem', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              <Pencil size={12} />
              You can edit this equipment request while it's still open.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null); // null = new, ticket obj = editing

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supportService.getTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const openNewModal = () => { setEditingTicket(null); setModalOpen(true); };
  const openEditModal = (ticket) => { setEditingTicket(ticket); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingTicket(null); };

  const openCount    = tickets.filter(t => t.status === 'open').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  return (
    <>
      <NewTicketModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSuccess={loadTickets}
        initialData={editingTicket}
      />

      <div className="page-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Support & Admin Contact</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
              Submit requests and track responses from your Admin.
            </p>
          </div>
          <button className="btn btn-primary" onClick={openNewModal} id="new-ticket-btn">
            <Plus size={16} /> New Request
          </button>
        </div>

        {/* Ticket stats */}
        {tickets.length > 0 && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ padding: '10px 18px', background: '#fff', border: '1px solid var(--earth-border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total </span>
              <strong>{tickets.length}</strong>
            </div>
            <div style={{ padding: '10px 18px', background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--warning-text)' }}>
              Open <strong>{openCount}</strong>
            </div>
            <div style={{ padding: '10px 18px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--success-text)' }}>
              Resolved <strong>{resolvedCount}</strong>
            </div>
          </div>
        )}

        {loading && <LoadingState message="Loading support tickets..." />}
        {error && <ErrorState error={error} onRetry={loadTickets} />}

        {!loading && !error && tickets.length === 0 && (
          <EmptyState
            title="No Support Requests Yet"
            description="Create a new request to contact your Admin about equipment issues, feedback, or general queries."
            action={<button className="btn btn-primary btn-sm" onClick={openNewModal}>+ New Request</button>}
          />
        )}

        {!loading && !error && tickets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tickets.map(ticket => (
              <TicketCard key={ticket._id} ticket={ticket} onEdit={openEditModal} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
