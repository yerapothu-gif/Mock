import { useState, useEffect, useCallback } from 'react';
import { volunteerService } from '../api/volunteerService';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { RegisterCandidateModal } from '../components/candidates/RegisterCandidateModal';
import {
  Award,
  Plus,
  Phone,
  MapPin,
  Wrench,
  CheckCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';

export function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vils, cands] = await Promise.all([
        volunteerService.getVillages(),
        volunteerService.getVLECandidates()
      ]);
      setVillages(vils);
      setCandidates(cands);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <>
      <RegisterCandidateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        villages={villages}
        onSuccess={() => loadData()}
      />

      <div className="page-container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>VLE Candidate Screening</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 3 }}>
              Field identification of local rural entrepreneurs capable of managing Foundation rental machinery.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setModalOpen(true)}
            id="btn-nominate-vle"
          >
            <Plus size={16} /> Nominate VLE Candidate
          </button>
        </div>

        {/* Info Box */}
        <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Award size={22} color="var(--primary-700)" />
          <div style={{ fontSize: '0.84rem', color: 'var(--primary-900)' }}>
            <strong>Volunteer Workflow:</strong> Identify trustworthy farmers or local youth with mechanical aptitude and community leadership. Submissions are screened by Foundation administrators for training &amp; machine custody.
          </div>
        </div>

        {/* Candidates List */}
        {loading && <LoadingState message="Loading nominated candidates..." />}
        {error && <ErrorState message={error} onRetry={loadData} />}

        {!loading && !error && candidates.length === 0 && (
          <EmptyState
            title="No VLE Candidates Identified Yet"
            description="You can identify candidates during farmer registration or nominate them directly here."
            action={
              <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>
                <Plus size={14} /> Nominate Candidate
              </button>
            }
          />
        )}

        {!loading && !error && candidates.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {candidates.map(cand => (
              <div key={cand._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                      {cand.name}
                    </h3>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <MapPin size={13} /> {cand.villageName || 'Assigned Village'}
                    </span>
                  </div>
                  <span
                    style={{
                      background: 'var(--terracotta-bg)',
                      color: 'var(--terracotta)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 999,
                      border: '1px solid #fed7aa',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Award size={12} /> Potential VLE
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem' }}>
                  <Phone size={14} color="var(--primary-700)" />
                  <a href={`tel:${cand.phone}`} style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {cand.phone}
                  </a>
                </div>

                {cand.notes && (
                  <div style={{ background: 'var(--earth-warm)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <strong>Screening Notes:</strong> {cand.notes}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--earth-warm)', paddingTop: 10, marginTop: 'auto', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  <span>Holding: {cand.landSize || '2'} ac ({cand.landholdingType || 'small'})</span>
                  <StatusBadge status={cand.status || 'synced'} type="sync" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
