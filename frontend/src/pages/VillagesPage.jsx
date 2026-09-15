import { useState, useEffect, useCallback } from 'react';
import { volunteerService } from '../api/volunteerService';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { AddVillageModal } from '../components/villages/AddVillageModal';
import { VillageDetailModal } from '../components/villages/VillageDetailModal';
import { RegisterFarmerModal } from '../components/farmers/RegisterFarmerModal';
import { NewAssessmentModal } from '../components/assessments/NewAssessmentModal';
import {
  MapPin,
  Search,
  Filter,
  Plus,
  Users,
  Wheat,
  Droplets,
  ChevronRight,
  Eye
} from 'lucide-react';

export function VillagesPage() {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [blockFilter, setBlockFilter] = useState('all');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [registerFarmerModalOpen, setRegisterFarmerModalOpen] = useState(false);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);

  const loadVillages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await volunteerService.getVillages({ search, stage: stageFilter });
      setVillages(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [search, stageFilter]);

  useEffect(() => {
    loadVillages();
  }, [loadVillages]);

  // Derived blocks for filtering
  const blocks = Array.from(new Set(villages.map(v => v.block))).filter(Boolean);

  const filteredVillages = villages.filter(v => {
    if (blockFilter !== 'all' && v.block !== blockFilter) return false;
    return true;
  });

  return (
    <>
      <AddVillageModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => loadVillages()}
      />
      <VillageDetailModal
        village={selectedVillage}
        isOpen={Boolean(selectedVillage)}
        onClose={() => setSelectedVillage(null)}
        onOpenRegisterFarmer={(v) => {
          setSelectedVillage(null);
          setRegisterFarmerModalOpen(true);
        }}
        onOpenAssessment={(v) => {
          setSelectedVillage(null);
          setAssessmentModalOpen(true);
        }}
        onVillageUpdated={() => loadVillages()}
      />
      <RegisterFarmerModal
        isOpen={registerFarmerModalOpen}
        onClose={() => setRegisterFarmerModalOpen(false)}
        defaultVillage={selectedVillage}
        villages={villages}
        onSuccess={() => loadVillages()}
      />
      <NewAssessmentModal
        isOpen={assessmentModalOpen}
        onClose={() => setAssessmentModalOpen(false)}
        defaultVillage={selectedVillage}
        villages={villages}
        onSuccess={() => loadVillages()}
      />

      <div className="page-container">
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Villages Directory</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 3 }}>
              Field operational tracking, readiness assessment &amp; GPS coordinates.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setAddModalOpen(true)}
            id="btn-add-village-page"
          >
            <Plus size={16} /> Add Village
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              className="form-input"
              placeholder="Search by village name, crops, or block..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Filter size={15} color="var(--text-muted)" />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Stage:</span>
            {['all', 'identified', 'assessed', 'vle-active'].map(stage => (
              <button
                key={stage}
                className={`btn btn-sm ${stageFilter === stage ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStageFilter(stage)}
                style={{ textTransform: 'capitalize', fontSize: '0.78rem' }}
              >
                {stage === 'all' ? 'All Stages' : stage.replace('-', ' ')}
              </button>
            ))}

            {blocks.length > 1 && (
              <select
                className="form-select"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
                value={blockFilter}
                onChange={(e) => setBlockFilter(e.target.value)}
              >
                <option value="all">All Blocks</option>
                {blocks.map(b => (
                  <option key={b} value={b}>{b} Block</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Content Area */}
        {loading && <LoadingState message="Loading villages..." />}
        {error && <ErrorState message={error} onRetry={loadVillages} />}

        {!loading && !error && filteredVillages.length === 0 && (
          <EmptyState
            title="No Villages Found"
            description={search || stageFilter !== 'all' ? 'No villages match the specified filters.' : 'Get started by creating your first field village record.'}
            action={
              <button className="btn btn-primary btn-sm" onClick={() => setAddModalOpen(true)}>
                <Plus size={14} /> Add Village
              </button>
            }
          />
        )}

        {!loading && !error && filteredVillages.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Village &amp; Location</th>
                      <th>Block / District</th>
                      <th>Farmers</th>
                      <th>Acres</th>
                      <th>Major Crops</th>
                      <th>Water Sources</th>
                      <th>Readiness</th>
                      <th>Sync</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVillages.map(v => (
                      <tr key={v._id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, color: 'var(--primary-900)' }}>
                              {v.name}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {v.location?.coordinates?.[1] ? `${v.location.coordinates[1]}°N, ${v.location.coordinates[0]}°E` : 'No GPS logged'}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.84rem' }}>
                          {v.block}, {v.district}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{v.farmerCount || 0}</span>
                        </td>
                        <td>
                          <span>{v.acres || 0} ac</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {(v.majorCrops || []).slice(0, 2).join(', ')}
                            {(v.majorCrops || []).length > 2 ? ` +${v.majorCrops.length - 2}` : ''}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {(v.waterResources || []).slice(0, 2).join(', ')}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={v.readinessStage} type="stage" />
                        </td>
                        <td>
                          <StatusBadge status={v.status || 'synced'} type="sync" />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedVillage(v)}
                            title="View village profile & actions"
                            style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <Eye size={13} /> Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
