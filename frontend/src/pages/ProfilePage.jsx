import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { vleService } from '../api/vleService';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { StatusBadge } from '../components/common/StatusBadge';
import { Lock, CheckCircle2, Cpu, Phone, MapPin, Mail, Home, RefreshCw } from 'lucide-react';

function AccountLockedBanner({ reason, onRefresh }) {
  return (
    <div className="locked-account-card">
      <div className="locked-icon-bubble">
        <Lock size={30} />
      </div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#991b1b', marginBottom: 10 }}>
        Account Locked — Training Required
      </h2>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20, maxWidth: 420, margin: '0 auto 20px' }}>
        Your VLE account is currently <strong>locked</strong> pending completion of the Foundation's
        field training programme. Once your Admin marks your training as complete, your account
        will be activated and you'll have full access to the VLE portal.
      </p>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '12px 20px', marginBottom: 24, fontSize: '0.82rem', color: '#991b1b', textAlign: 'left' }}>
        <strong>API Response:</strong> 403 Forbidden — "{reason || 'Training incomplete. Account is locked.'}"
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" onClick={onRefresh} id="profile-refresh-lock-btn">
          <RefreshCw size={14} /> Check Again
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--earth-border-subtle)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--earth-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-700)', flexShrink: 0 }}>
        <Icon size={16} />
      </div>
      <div>
        <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{label}</p>
        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { vleProfile, isLocked, lockedReason, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(vleProfile);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(!vleProfile);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, eqRes] = await Promise.all([
        vleService.getProfile(),
        vleService.getEquipment()
      ]);
      setProfile(profileRes);
      setEquipment(eqRes || []);
    } catch (err) {
      if (err.status === 403) {
        // Locked — don't set error, let isLocked handle UI
      } else {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefreshLock = async () => {
    await refreshProfile();
    if (!isLocked) await load();
  };

  if (isLocked) {
    return (
      <div className="page-container">
        <AccountLockedBanner reason={lockedReason} onRefresh={handleRefreshLock} />
      </div>
    );
  }

  if (loading) return <div className="page-container"><LoadingState message="Loading profile..." /></div>;
  if (error) return <div className="page-container"><ErrorState error={error} onRetry={load} /></div>;

  const p = profile || vleProfile || {};

  const initials = p.name
    ? p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'VL';

  return (
    <div className="page-container">
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: 24, alignItems: 'start' }}>
        {/* Profile Card */}
        <div className="card">
          <div style={{ padding: '28px 24px', textAlign: 'center', borderBottom: '1px solid var(--earth-border)', background: 'linear-gradient(135deg, var(--primary-900), var(--primary-800))' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, margin: '0 auto 14px', boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}>
              {initials}
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{p.name || '—'}</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--primary-300)', marginTop: 4 }}>Village Level Entrepreneur</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
              <StatusBadge status={p.accountStatus} label={p.accountStatus === 'active' ? 'Active' : 'Locked'} />
              <StatusBadge status={p.trainingStatus === 'completed' ? 'paid' : 'pending'} label={p.trainingStatus === 'completed' ? 'Trained' : 'Training Pending'} />
            </div>
          </div>
          <div className="card-body">
            <InfoRow icon={Phone} label="Phone" value={p.phone} />
            {p.contactInfo?.email && <InfoRow icon={Mail} label="Email" value={p.contactInfo.email} />}
            {p.contactInfo?.address && <InfoRow icon={Home} label="Address" value={p.contactInfo.address} />}
            {p.district && <InfoRow icon={MapPin} label="District" value={`${p.block ? p.block + ', ' : ''}${p.district}`} />}
            {p.villageName && <InfoRow icon={MapPin} label="Village" value={p.villageName} />}
            {p.trainingCompletedAt && (
              <InfoRow
                icon={CheckCircle2}
                label="Training Completed"
                value={new Date(p.trainingCompletedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              />
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Earnings Summary */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">Earnings Overview</h3></div>
            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>Total Earnings</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-700)' }}>₹{p.totalEarnings?.toLocaleString('en-IN') || 0}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>Rentals</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{p.totalRentalsCount || 0}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>Acres</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{p.totalAcresServiced || 0}</p>
              </div>
            </div>
          </div>

          {/* Assigned Equipment */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">Assigned Equipment</h3></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {equipment.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No equipment assigned yet.</p>
              ) : equipment.map(eq => (
                <div key={eq.machineId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--earth-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--earth-border)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-800)', flexShrink: 0 }}>
                    <Cpu size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{eq.machineType}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{eq.machineId}</p>
                  </div>
                  <StatusBadge status={eq.condition} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
