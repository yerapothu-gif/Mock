import { useVolunteerAuth } from '../context/VolunteerAuthContext';
import { useVolunteerOffline } from '../context/VolunteerOfflineContext';
import {
  UserCheck,
  MapPin,
  Phone,
  Mail,
  Shield,
  Database,
  Smartphone,
  CheckCircle,
  HardDrive
} from 'lucide-react';

export function VolunteerProfilePage() {
  const { volunteer } = useVolunteerAuth();
  const { pendingCount, isOnline } = useVolunteerOffline();

  return (
    <div className="page-container">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Field Volunteer Profile</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 3 }}>
          Verified field personnel credentials and operational assignment area.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 20 }}>
        {/* Left Column: Personal & Assignment Info */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--primary-100)',
                color: 'var(--primary-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 800,
                border: '2px solid var(--primary-300)'
              }}
            >
              {volunteer?.name?.slice(0, 2).toUpperCase() || 'VR'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                  {volunteer?.name || 'Ranjitha Rao'}
                </h2>
                <span
                  style={{
                    background: 'var(--success-bg)',
                    color: 'var(--success-text)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    border: '1px solid var(--success-border)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <CheckCircle size={11} /> Verified Volunteer
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                Reaching Roots Foundation • Field Operations Unit
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--earth-warm)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem' }}>
              <Phone size={16} color="var(--primary-700)" />
              <span style={{ color: 'var(--text-muted)', width: 80 }}>Phone:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{volunteer?.phone || '9876501234'}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem' }}>
              <Mail size={16} color="var(--primary-700)" />
              <span style={{ color: 'var(--text-muted)', width: 80 }}>Email:</span>
              <span>{volunteer?.email || 'ranjitha.volunteer@reachingroots.org'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem' }}>
              <MapPin size={16} color="var(--primary-700)" />
              <span style={{ color: 'var(--text-muted)', width: 80 }}>District:</span>
              <span>{volunteer?.district || 'Raisen'}, {volunteer?.state || 'Madhya Pradesh'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.88rem' }}>
              <Shield size={16} color="var(--primary-700)" style={{ marginTop: 2 }} />
              <span style={{ color: 'var(--text-muted)', width: 80 }}>Assigned:</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(volunteer?.assignedBlocks || ['Obedullaganj', 'Silwani', 'Gairatganj']).map(b => (
                  <span
                    key={b}
                    style={{
                      background: 'var(--earth-warm)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: '1px solid var(--earth-border)'
                    }}
                  >
                    {b} Block
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Device & Offline DB Diagnostics */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-900)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <HardDrive size={18} color="var(--primary-700)" /> Device &amp; Offline Storage
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--earth-warm)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Local Indexed Records:</span>
              <strong>38 village &amp; farmer records</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--earth-warm)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Pending Batch Uploads:</span>
              <strong style={{ color: pendingCount > 0 ? 'var(--amber-text)' : 'var(--success-text)' }}>
                {pendingCount} record{pendingCount === 1 ? '' : 's'}
              </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--earth-warm)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>GPS Geolocation Engine:</span>
              <span style={{ color: 'var(--success-text)', fontWeight: 700 }}>Active (W3C Standard)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--earth-warm)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Client Version:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>v2.4.1 (Field-Volunteer)</span>
            </div>
          </div>

          <div style={{ marginTop: 'auto', padding: 12, background: 'var(--primary-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary-200)' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--primary-800)', lineHeight: 1.4 }}>
              <strong>Field Security Notice:</strong> All captured GPS coordinates and farmer landholding surveys are encrypted and stored in private local application sandbox storage when outside mobile tower range.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
