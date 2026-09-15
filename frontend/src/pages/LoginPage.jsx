import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading, authError } = useAuth();
  const [form, setForm] = useState({ phone: '9826012345', password: 'Password@123' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.phone.trim()) e.phone = 'Phone number is required.';
    else if (!/^\d{10}$/.test(form.phone.trim())) e.phone = 'Enter a valid 10-digit phone number.';
    if (!form.password) e.password = 'Password is required.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    try {
      await login(form.phone.trim(), form.password);
    } catch {
      // AuthContext already sets authError
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--primary-900) 0%, var(--primary-800) 40%, #2d5a3d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#fff',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ background: 'var(--primary-800)', padding: '32px 36px 28px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
            <Leaf size={26} color="#52b788" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.35rem', fontWeight: 800, marginBottom: 4 }}>Reaching Roots</h1>
          <p style={{ color: 'var(--primary-300)', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>VLE Field Operations Portal</p>
        </div>

        {/* Form */}
        <div style={{ padding: '28px 36px 36px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24, textAlign: 'center' }}>
            Sign in with your VLE credentials
          </p>

          {authError && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20, fontSize: '0.82rem', color: 'var(--danger-text)' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-phone">Mobile Number</label>
              <input
                id="login-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                className={`form-input ${errors.phone ? 'error' : ''}`}
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={handleChange}
                autoComplete="username"
              />
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              id="login-submit-btn"
              disabled={isLoading}
              style={{ width: '100%', marginTop: 8 }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--earth-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--earth-border)' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 6 }}>Demo Credentials (Pre-filled)</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Phone: <code style={{ fontFamily: 'var(--font-mono)', background: '#fff', padding: '1px 5px', borderRadius: 3, fontSize: '0.78rem' }}>9826012345</code>
              &nbsp;&nbsp;Password: <code style={{ fontFamily: 'var(--font-mono)', background: '#fff', padding: '1px 5px', borderRadius: 3, fontSize: '0.78rem' }}>Password@123</code>
            </p>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 20 }}>
            Only VLE accounts can access this portal.
          </p>
        </div>
      </div>
    </div>
  );
}
