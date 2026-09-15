import { useState, useEffect, useCallback } from 'react';
import { volunteerService } from '../api/volunteerService';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { RegisterFarmerModal } from '../components/farmers/RegisterFarmerModal';
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  Award,
  Wheat,
  MapPin
} from 'lucide-react';

export function FarmersPage() {
  const [farmers, setFarmers] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('all');
  const [potentialVLEFilter, setPotentialVLEFilter] = useState('all');

  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vils, fams] = await Promise.all([
        volunteerService.getVillages(),
        volunteerService.getFarmers(selectedVillageId)
      ]);
      setVillages(vils);
      setFarmers(fams);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [selectedVillageId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredFarmers = farmers.filter(f => {
    if (search) {
      const q = search.toLowerCase().trim();
      const match =
        f.name.toLowerCase().includes(q) ||
        f.phone.includes(q) ||
        (f.villageName && f.villageName.toLowerCase().includes(q)) ||
        (f.crops && f.crops.some(c => c.toLowerCase().includes(q)));
      if (!match) return false;
    }
    if (potentialVLEFilter === 'vle' && !f.isPotentialVLE) return false;
    return true;
  });

  return (
    <>
      <RegisterFarmerModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        villages={villages}
        onSuccess={() => loadData()}
      />

      <div className="page-container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Farmer Registry</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 3 }}>
              Field registration of farmers, landholding data &amp; potential VLE identification.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setRegisterModalOpen(true)}
            id="btn-register-farmer-page"
          >
            <Plus size={16} /> Register Farmer
          </button>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              className="form-input"
              placeholder="Search by farmer name, phone number, or crop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
              value={selectedVillageId}
              onChange={(e) => setSelectedVillageId(e.target.value)}
            >
              <option value="all">All Villages</option>
              {villages.map(v => (
                <option key={v._id} value={v._id}>{v.name}</option>
              ))}
            </select>

            <button
              className={`btn btn-sm ${potentialVLEFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPotentialVLEFilter('all')}
              style={{ fontSize: '0.78rem' }}
            >
              All Farmers
            </button>
            <button
              className={`btn btn-sm ${potentialVLEFilter === 'vle' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPotentialVLEFilter('vle')}
              style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <Award size={13} color="var(--terracotta)" /> Potential VLEs Only
            </button>
          </div>
        </div>

        {/* Table & Content */}
        {loading && <LoadingState message="Loading registered farmers..." />}
        {error && <ErrorState message={error} onRetry={loadData} />}

        {!loading && !error && filteredFarmers.length === 0 && (
          <EmptyState
            title="No Farmers Registered"
            description={search ? 'No farmers match your search.' : 'Register your first farmer in this village.'}
            action={
              <button className="btn btn-primary btn-sm" onClick={() => setRegisterModalOpen(true)}>
                <Plus size={14} /> Register Farmer
              </button>
            }
          />
        )}

        {!loading && !error && filteredFarmers.length > 0 && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Farmer Name</th>
                    <th>Contact Phone</th>
                    <th>Village</th>
                    <th>Land Size</th>
                    <th>Holding Category</th>
                    <th>Crops Cultivated</th>
                    <th>VLE Candidate?</th>
                    <th>Sync</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFarmers.map(f => (
                    <tr key={f._id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary-900)' }}>
                            {f.name}
                          </span>
                          {f.notes && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {f.notes}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}>
                        <a href={`tel:${f.phone}`} style={{ color: 'var(--primary-700)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Phone size={12} /> {f.phone}
                        </a>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.84rem' }}>
                          <MapPin size={13} color="var(--text-muted)" /> {f.villageName || 'Assigned Village'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{f.landSize} ac</span>
                      </td>
                      <td>
                        <StatusBadge status={f.landholdingType} type="landholding" />
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {(f.crops || []).join(', ')}
                        </span>
                      </td>
                      <td>
                        {f.isPotentialVLE ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              background: 'var(--terracotta-bg)',
                              color: 'var(--terracotta)',
                              padding: '2px 8px',
                              borderRadius: 999,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              border: '1px solid #fed7aa'
                            }}
                          >
                            <Award size={12} /> Potential VLE
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={f.status || 'synced'} type="sync" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
