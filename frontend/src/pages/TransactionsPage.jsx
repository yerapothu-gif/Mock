import { useState, useEffect, useCallback } from 'react';
import { transactionService } from '../api/transactionService';
import { vleService } from '../api/vleService';
import { RecordRentalModal } from '../components/transactions/RecordRentalModal';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Plus, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [rentalOpen, setRentalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const loadTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await transactionService.getTransactions(page, 20);
      setTransactions(res?.data || []);
      if (res?.pagination) setPagination(res.pagination);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions(1);
    vleService.getEquipment().then(setEquipment).catch(() => {});
  }, [loadTransactions]);

  const filtered = filterStatus === 'all'
    ? transactions
    : transactions.filter(t => t.paymentStatus === filterStatus);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <RecordRentalModal
        isOpen={rentalOpen}
        onClose={() => setRentalOpen(false)}
        equipment={equipment}
        onSuccess={() => loadTransactions(1)}
      />
      <div className="page-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Rental History</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>All rental transactions recorded by you.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setRentalOpen(true)} id="transactions-record-rental-btn">
            <Plus size={16} /> Record Rental
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          {['all', 'paid', 'pending', 'partial'].map(status => (
            <button
              key={status}
              className={`btn btn-sm ${filterStatus === status ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterStatus(status)}
              id={`filter-${status}-btn`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
          {pagination.total > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {pagination.total} total transactions
            </span>
          )}
        </div>

        {loading && <LoadingState message="Loading transactions..." />}
        {error && <ErrorState error={error} onRetry={() => loadTransactions(1)} />}

        {!loading && !error && (
          <div className="card">
            {filtered.length === 0 ? (
              <EmptyState
                title="No Transactions Found"
                description={filterStatus !== 'all' ? `No ${filterStatus} transactions yet.` : 'Record your first rental to see it here.'}
                action={<button className="btn btn-primary btn-sm" onClick={() => setRentalOpen(true)}>+ Record Rental</button>}
              />
            ) : (
              <>
                {/* Desktop Table */}
                <div className="table-responsive" style={{ display: 'block' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Farmer</th>
                        <th>Machine</th>
                        <th>Type</th>
                        <th>Duration</th>
                        <th>Acres</th>
                        <th>Fee (₹)</th>
                        <th>Payment</th>
                        <th>Sync</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(txn => (
                        <tr key={txn._id}>
                          <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{formatDate(txn.date)}</td>
                          <td style={{ fontWeight: 600 }}>{txn.farmerName}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{txn.machineId}</td>
                          <td style={{ fontSize: '0.82rem' }}>{txn.machineType}</td>
                          <td>{txn.durationHours}h</td>
                          <td>{txn.acresCovered ?? '—'} ac</td>
                          <td style={{ fontWeight: 700, color: 'var(--primary-800)' }}>₹{txn.feeCharged?.toLocaleString('en-IN')}</td>
                          <td><StatusBadge status={txn.paymentStatus} /></td>
                          <td><StatusBadge status={txn.syncStatus || 'synced'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div style={{ padding: '16px 24px', borderTop: '1px solid var(--earth-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => loadTransactions(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => loadTransactions(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
