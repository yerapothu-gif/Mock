import React from 'react';
import { Shield, Sprout, Briefcase, LogOut, UserCircle, Wifi, WifiOff } from 'lucide-react';

export default function Navbar({ currentUser, activeRole, onSwitchRole, onOpenAuth, onLogout, isOnline }) {
  const roleConfig = {
    volunteer: { label: 'Field Volunteer', color: 'badge-blue', icon: Sprout },
    admin: { label: 'NGO Admin Staff', color: 'badge-amber', icon: Shield },
    vle: { label: 'VLE Operator', color: 'badge-green', icon: Briefcase },
  };

  const currentRoleInfo = roleConfig[activeRole] || roleConfig.volunteer;
  const RoleIcon = currentRoleInfo.icon;

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(7, 9, 14, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 24px',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)'
          }}>
            <Sprout size={22} color="#041f0d" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
              Reaching Roots
              <span style={{ fontSize: 11, background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '2px 7px', borderRadius: 4, border: '1px solid rgba(74, 222, 128, 0.3)', fontWeight: 700 }}>
                FOUNDATION
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
              Rural Mechanization & Entrepreneurship Ecosystem
            </div>
          </div>
        </div>

        {/* Role Switcher Tabs (Demo-Friendly for fast presentation) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: 4,
          borderRadius: 12,
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            className="btn btn-sm"
            onClick={() => onSwitchRole('volunteer')}
            style={{
              background: activeRole === 'volunteer' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: activeRole === 'volunteer' ? '#38bdf8' : '#94a3b8',
              border: activeRole === 'volunteer' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              fontWeight: 600,
            }}
          >
            <Sprout size={15} />
            Volunteer View
          </button>
          <button
            className="btn btn-sm"
            onClick={() => onSwitchRole('admin')}
            style={{
              background: activeRole === 'admin' ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
              color: activeRole === 'admin' ? '#fbbf24' : '#94a3b8',
              border: activeRole === 'admin' ? '1px solid rgba(251, 191, 36, 0.4)' : '1px solid transparent',
              fontWeight: 600,
            }}
          >
            <Shield size={15} />
            Admin View
          </button>
          <button
            className="btn btn-sm"
            onClick={() => onSwitchRole('vle')}
            style={{
              background: activeRole === 'vle' ? 'rgba(74, 222, 128, 0.2)' : 'transparent',
              color: activeRole === 'vle' ? '#4ade80' : '#94a3b8',
              border: activeRole === 'vle' ? '1px solid rgba(74, 222, 128, 0.4)' : '1px solid transparent',
              fontWeight: 600,
            }}
          >
            <Briefcase size={15} />
            VLE View
          </button>
        </div>

        {/* User Status / Auth Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Online/Offline status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: isOnline ? '#4ade80' : '#fb7185' }}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{isOnline ? 'Online Sync' : 'Offline Mode'}</span>
          </div>

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  {currentUser.phone}
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={onLogout}
                title="Log Out"
                style={{ padding: '6px 10px' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onOpenAuth}>
              <UserCircle size={16} />
              Sign In / Switch Account
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
