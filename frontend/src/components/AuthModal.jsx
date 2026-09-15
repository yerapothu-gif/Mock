import React, { useState } from 'react';
import { X, Shield, Sprout, Briefcase, KeyRound, Phone, User, Mail, ArrowRight } from 'lucide-react';
import { authApi, setAuthSession } from '../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, defaultRole = 'volunteer' }) {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState(defaultRole);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Full name is required');
        if (!phone.trim()) throw new Error('Phone number is required');

        await authApi.register({
          name: name.trim(),
          phone: phone.trim(),
          password,
          role,
          email: email.trim() || undefined,
        });
      }

      // Login to obtain JWT
      const res = await authApi.login(phone.trim(), password);
      const user = res.data?.user;
      const token = res.data?.accessToken;

      if (!token) throw new Error('Failed to retrieve authentication token');

      setAuthSession(user, token);
      onAuthSuccess(user, user.role || role);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // One-click quick demo login helper
  const handleQuickLogin = async (targetRole) => {
    setError('');
    setLoading(true);
    const demoNumber = targetRole === 'admin' ? '9811111111' : targetRole === 'volunteer' ? '9822222222' : '9833333333';
    const demoName = targetRole === 'admin' ? 'Regional Director (Admin)' : targetRole === 'volunteer' ? 'Kisan Volunteer (Field)' : 'Mukesh Patel (VLE)';

    try {
      // First attempt login
      try {
        const res = await authApi.login(demoNumber, 'Password123!');
        setAuthSession(res.data.user, res.data.accessToken);
        onAuthSuccess(res.data.user, res.data.user.role);
        onClose();
        return;
      } catch {
        // If demo user doesn't exist yet, auto-register
        await authApi.register({
          name: demoName,
          phone: demoNumber,
          password: 'Password123!',
          role: targetRole,
        });
        const res2 = await authApi.login(demoNumber, 'Password123!');
        setAuthSession(res2.data.user, res2.data.accessToken);
        onAuthSuccess(res2.data.user, res2.data.user.role);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, padding: 32 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 22, color: '#f8fafc' }}>
              {isRegister ? 'Create Foundation Account' : 'Portal Sign In'}
            </h2>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              Select your role to access the appropriate dashboard
            </p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ borderRadius: '50%', width: 32, height: 32, padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Demo Logins Banner */}
        <div style={{
          background: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid rgba(74, 222, 128, 0.25)',
          borderRadius: 12,
          padding: 12,
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Hackathon One-Click Demo Access
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('volunteer')}
              disabled={loading}
              style={{ fontSize: 11, padding: '6px 8px' }}
            >
              <Sprout size={12} color="#38bdf8" />
              Volunteer
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('admin')}
              disabled={loading}
              style={{ fontSize: 11, padding: '6px 8px' }}
            >
              <Shield size={12} color="#fbbf24" />
              Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('vle')}
              disabled={loading}
              style={{ fontSize: 11, padding: '6px 8px' }}
            >
              <Briefcase size={12} color="#4ade80" />
              VLE
            </button>
          </div>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
          <button
            type="button"
            className="btn"
            onClick={() => setRole('volunteer')}
            style={{
              padding: '10px 8px',
              fontSize: 12,
              background: role === 'volunteer' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: role === 'volunteer' ? '#38bdf8' : '#94a3b8',
              borderColor: role === 'volunteer' ? '#38bdf8' : 'var(--border-subtle)',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <Sprout size={16} />
            Volunteer
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setRole('admin')}
            style={{
              padding: '10px 8px',
              fontSize: 12,
              background: role === 'admin' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: role === 'admin' ? '#fbbf24' : '#94a3b8',
              borderColor: role === 'admin' ? '#fbbf24' : 'var(--border-subtle)',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <Shield size={16} />
            Admin
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setRole('vle')}
            style={{
              padding: '10px 8px',
              fontSize: 12,
              background: role === 'vle' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: role === 'vle' ? '#4ade80' : '#94a3b8',
              borderColor: role === 'vle' ? '#4ade80' : 'var(--border-subtle)',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <Briefcase size={16} />
            VLE
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(251, 113, 133, 0.12)',
            border: '1px solid rgba(251, 113, 133, 0.35)',
            color: '#fb7185',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isRegister && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: 38 }}
                  required
                />
                <User size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                className="input-field"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ paddingLeft: 38 }}
                required
              />
              <Phone size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {isRegister && (
            <div className="input-group">
              <label className="input-label">Email Address (Optional)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="input-field"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: 38 }}
                />
                <Mail size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="input-field"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: 38 }}
                required
              />
              <KeyRound size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading ? 'Processing...' : isRegister ? 'Register & Continue' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#4ade80',
              fontSize: 13,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isRegister ? 'Already have an account? Sign in here' : "Don't have an account? Register new user"}
          </button>
        </div>
      </div>
    </div>
  );
}
