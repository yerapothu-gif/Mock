import { useState, useEffect, useCallback } from 'react';
import { volunteerService } from '../api/volunteerService';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { NewAssessmentModal } from '../components/assessments/NewAssessmentModal';
import {
  ClipboardList,
  Plus,
  MapPin,
  Calendar,
  AlertTriangle,
  Users,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function NeedsAssessmentPage() {
  const [assessments, setAssessments] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vils, asss] = await Promise.all([
        volunteerService.getVillages(),
        volunteerService.getAssessments()
      ]);
      setVillages(vils);
      setAssessments(asss);
      if (asss.length > 0) setExpandedId(asss[0]._id);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <>
      <NewAssessmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        villages={villages}
        onSuccess={() => loadData()}
      />

      <div className="page-container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Agricultural Needs Assessments</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 3 }}>
              Field surveys identifying machinery shortages, seasonal bottlenecks &amp; farmer equipment demands.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setModalOpen(true)}
            id="btn-new-assessment-page"
          >
            <Plus size={16} /> Conduct Assessment
          </button>
        </div>

        {/* Content */}
        {loading && <LoadingState message="Loading completed needs assessments..." />}
        {error && <ErrorState message={error} onRetry={loadData} />}

        {!loading && !error && assessments.length === 0 && (
          <EmptyState
            title="No Needs Assessments Conducted"
            description="Assessments capture village agricultural bottlenecks and farmer machinery requests."
            action={
              <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>
                <Plus size={14} /> Conduct First Assessment
              </button>
            }
          />
        )}

        {!loading && !error && assessments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {assessments.map(ass => {
              const isExpanded = expandedId === ass._id;
              return (
                <div
                  key={ass._id}
                  className="card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    border: isExpanded ? '1.5px solid var(--primary-500)' : '1px solid var(--earth-border)'
                  }}
                >
                  {/* Card Header Accordion */}
                  <div
                    onClick={() => toggleExpand(ass._id)}
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: isExpanded ? 'var(--primary-50)' : '#ffffff',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                      <div className="stat-icon green" style={{ width: 40, height: 40 }}>
                        <ClipboardList size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                            {ass.villageName} Needs Assessment
                          </h3>
                          <StatusBadge status={ass.status || 'synced'} type="sync" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <span>Conducted by: <strong>{ass.conductedBy || 'Volunteer'}</strong></span>
                          <span>•</span>
                          <span>{new Date(ass.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {(ass.farmerRequests || []).length} Farmer Requests
                      </span>
                      {isExpanded ? <ChevronUp size={18} color="var(--primary-700)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18, borderTop: '1px solid var(--earth-border)' }}>
                      {/* Gaps Chips */}
                      <div>
                        <h4 style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                          Identified Machinery &amp; Labor Gaps
                        </h4>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {(ass.gapsIdentified || []).map((gap, i) => (
                            <span
                              key={i}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '4px 10px',
                                borderRadius: 999,
                                background: 'var(--amber-bg)',
                                color: 'var(--amber-text)',
                                border: '1px solid var(--amber-border)',
                                fontSize: '0.78rem',
                                fontWeight: 600
                              }}
                            >
                              <AlertTriangle size={12} /> {gap}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Evaluated Processes */}
                      {ass.processesEvaluated && ass.processesEvaluated.length > 0 && (
                        <div>
                          <h4 style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                            Agricultural Processes Evaluated ({ass.processesEvaluated.length})
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                            {ass.processesEvaluated.map((proc, idx) => (
                              <div
                                key={idx}
                                style={{
                                  padding: 12,
                                  background: 'var(--earth-warm)',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px solid var(--earth-border)',
                                  fontSize: '0.82rem'
                                }}
                              >
                                <span style={{ fontWeight: 700, color: 'var(--primary-800)', textTransform: 'capitalize', display: 'block', marginBottom: 4 }}>
                                  {proc.stage.replace(/_/g, ' ')}
                                </span>
                                <div style={{ color: 'var(--text-primary)', marginBottom: 3 }}>
                                  <strong>Challenges:</strong> {proc.challengesFaced}
                                </div>
                                <div style={{ color: 'var(--text-secondary)' }}>
                                  <strong>Practice:</strong> {proc.currentPractice}
                                </div>
                                {proc.notes && (
                                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginTop: 4 }}>
                                    <em>Note: {proc.notes}</em>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Specific Farmer Demands */}
                      {ass.farmerRequests && ass.farmerRequests.length > 0 && (
                        <div>
                          <h4 style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                            Farmer Demands Recorded ({ass.farmerRequests.length})
                          </h4>
                          <div className="table-responsive">
                            <table className="custom-table" style={{ background: '#ffffff' }}>
                              <thead>
                                <tr>
                                  <th>Farmer</th>
                                  <th>Equipment Needed</th>
                                  <th>Urgency</th>
                                  <th>Notes</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ass.farmerRequests.map((req, rIdx) => (
                                  <tr key={rIdx}>
                                    <td style={{ fontWeight: 600 }}>{req.farmerName}</td>
                                    <td>
                                      <span style={{ fontWeight: 600, color: 'var(--primary-800)' }}>
                                        {req.requestType}
                                      </span>
                                    </td>
                                    <td>
                                      <StatusBadge status={req.urgency} type="urgency" />
                                    </td>
                                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                      {req.notes || '—'}
                                    </td>
                                    <td>
                                      <span style={{ fontSize: '0.76rem', color: req.status === 'fulfilled' ? 'var(--success)' : 'var(--amber)', fontWeight: 600, textTransform: 'capitalize' }}>
                                        {req.status || 'open'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Summary Notes */}
                      {ass.summaryNotes && (
                        <div style={{ padding: 12, background: '#faf9f6', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary-600)' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-800)', display: 'block', marginBottom: 2 }}>
                            Volunteer Recommendation Notes:
                          </span>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                            "{ass.summaryNotes}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
