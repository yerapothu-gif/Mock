import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { volunteerService } from '../../api/volunteerService';
import { useToast } from '../../context/ToastContext';
import { MapPin, Users, Droplets, Wheat, ShieldCheck, ArrowRight, Plus, ClipboardList } from 'lucide-react';

export function VillageDetailModal({
  village,
  isOpen,
  onClose,
  onOpenRegisterFarmer,
  onOpenAssessment,
  onVillageUpdated
}) {
  const { toast } = useToast();
  const [farmers, setFarmers] = useState([]);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    if (village?._id) {
      volunteerService.getFarmers(village._id).then(setFarmers).catch(() => setFarmers([]));
    }
  }, [village]);

  if (!village) return null;

  const lat = village.location?.coordinates?.[1];
  const lng = village.location?.coordinates?.[0];

  const handleAdvanceStage = async (nextStage) => {
    setAdvancing(true);
    try {
      const res = await volunteerService.updateVillage(village._id, { readinessStage: nextStage });
      toast(`Village readiness updated to ${nextStage}!`, 'success');
      onVillageUpdated?.(res.data);
    } catch (err) {
      toast(err.message || 'Failed to update readiness.', 'error');
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${village.name} — Field Village Profile`}
      maxWidth="720px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Advance Stage:</span>
            {village.readinessStage === 'identified' && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleAdvanceStage('assessed')}
                disabled={advancing}
              >
                Mark as Assessed <ArrowRight size={13} />
              </button>
            )}
            {village.readinessStage === 'assessed' && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleAdvanceStage('vle-active')}
                disabled={advancing}
              >
                Mark VLE Active <ShieldCheck size={13} />
              </button>
            )}
            {village.readinessStage === 'vle-active' && (
              <span style={{ fontSize: '0.82rem', color: 'var(--success-text)', fontWeight: 600 }}>
                ✓ Fully Operational
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Header Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {village.block} Block • {village.district} District
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <StatusBadge status={village.readinessStage} type="stage" />
            <StatusBadge status={village.status || 'synced'} type="sync" />
          </div>
        </div>

        {/* Location & GPS Box */}
        <div style={{ padding: '12px 16px', background: 'var(--earth-warm)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} color="var(--primary-700)" />
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
              Geo-Coordinates:
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', background: '#fff', padding: '3px 8px', borderRadius: 4, border: '1px solid var(--earth-border)' }}>
              {lat ?? '—'}° N, {lng ?? '—'}° E
            </span>
          </div>

          <a
            href={`https://maps.google.com/?q=${lat},${lng}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem' }}
          >
            Open in Google Maps
          </a>
        </div>

        {/* Key Agricultural Metrics */}
        <div className="stat-card-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-icon green">
              <Users size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{village.farmerCount || farmers.length || 0}</span>
              <span className="stat-label">Farmers Count</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon terracotta">
              <Wheat size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{village.acres || 0}</span>
              <span className="stat-label">Cultivable Acres</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Droplets size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{(village.waterResources || []).length}</span>
              <span className="stat-label">Water Sources</span>
            </div>
          </div>
        </div>

        {/* Crops & Water Sources */}
        <div className="form-grid-2">
          <div className="card" style={{ padding: 14 }}>
            <h4 style={{ fontSize: '0.88rem', marginBottom: 8, color: 'var(--primary-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wheat size={15} /> Major Crops
            </h4>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(village.majorCrops || []).map((crop, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.78rem',
                    background: 'var(--primary-50)',
                    color: 'var(--primary-800)',
                    padding: '3px 8px',
                    borderRadius: 999,
                    border: '1px solid var(--primary-200)',
                    fontWeight: 600
                  }}
                >
                  {crop}
                </span>
              ))}
              {(!village.majorCrops || village.majorCrops.length === 0) && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None recorded</span>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: 14 }}>
            <h4 style={{ fontSize: '0.88rem', marginBottom: 8, color: 'var(--primary-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Droplets size={15} /> Water Resources
            </h4>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(village.waterResources || []).map((w, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.78rem',
                    background: 'var(--blue-bg)',
                    color: 'var(--blue-text)',
                    padding: '3px 8px',
                    borderRadius: 999,
                    border: '1px solid #bfdbfe',
                    fontWeight: 600
                  }}
                >
                  {w}
                </span>
              ))}
              {(!village.waterResources || village.waterResources.length === 0) && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None recorded</span>
              )}
            </div>
          </div>
        </div>

        {/* Community Structures */}
        {village.communityStructures && village.communityStructures.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.88rem', marginBottom: 8, color: 'var(--text-primary)' }}>
              Local Community Structures ({village.communityStructures.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {village.communityStructures.map((cs, i) => (
                <div
                  key={i}
                  style={{
                    padding: '8px 12px',
                    background: '#fff',
                    border: '1px solid var(--earth-border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <strong style={{ color: 'var(--primary-800)' }}>[{cs.type}]</strong> {cs.name}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {cs.contactPerson} {cs.phone ? `(${cs.phone})` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Field Actions on Village */}
        <div style={{ borderTop: '1px solid var(--earth-warm)', paddingTop: 14 }}>
          <h4 style={{ fontSize: '0.88rem', marginBottom: 10 }}>Field Actions for this Village</h4>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                onClose();
                onOpenRegisterFarmer?.(village);
              }}
              id="btn-village-register-farmer"
            >
              <Plus size={14} /> Register Farmer in {village.name}
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                onClose();
                onOpenAssessment?.(village);
              }}
              id="btn-village-create-assessment"
            >
              <ClipboardList size={14} /> Conduct Needs Assessment
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
