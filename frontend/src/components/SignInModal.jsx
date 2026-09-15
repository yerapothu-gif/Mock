import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SignInModal({ isOpen, onClose, onEnterAdmin, initialRole = 'volunteer' }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'register'
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Account Registration Fields (Volunteer / VLE)
  const [registerRole, setRegisterRole] = useState('volunteer');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [registeredAccount, setRegisteredAccount] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      const loggedInUser = await login(phone.trim(), password);
      setSubmitted(true);
      if (loggedInUser?.role === 'admin' && onEnterAdmin) {
        // Let the success screen show briefly before handing off to the admin console
        setTimeout(() => {
          resetState();
          onClose();
          onEnterAdmin();
        }, 900);
      }
    } catch (err) {
      setFormError(err?.message || 'Sign in failed. Check your phone number and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      await register(regName.trim(), regPhone.trim(), regPassword, registerRole);
      setRegisteredAccount({
        name: regName,
        phone: regPhone,
        role: registerRole,
      });
      setSelectedRole(registerRole);
      setSubmitted(true);
    } catch (err) {
      setFormError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setSubmitted(false);
    setRegisteredAccount(null);
    setFormError('');
    setMode('signin');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(28, 28, 28, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={() => {
        resetState();
        onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxWidth: '540px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '4px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          border: '1px solid var(--brand-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            backgroundColor: 'var(--brand-green-dark)',
            padding: '26px 32px',
            color: '#ffffff',
            position: 'relative',
          }}
        >
          <button
            onClick={() => {
              resetState();
              onClose();
            }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1.4rem',
              cursor: 'pointer',
              lineHeight: 1,
            }}
            aria-label="Close modal"
          >
            ✕
          </button>

          <img
            src="/images/logo.png"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://framerusercontent.com/images/cN8Y0VLU8UWjo1mrNrSz9L1IuWU.png';
            }}
            alt="Reaching Roots"
            style={{
              height: '34px',
              marginBottom: '12px',
              filter: 'brightness(0) invert(1)',
              objectFit: 'contain',
            }}
          />

          <h3
            style={{
              color: '#ffffff',
              fontSize: '1.35rem',
              fontWeight: 700,
              margin: '0 0 6px',
            }}
          >
            {mode === 'signin' ? 'Platform Access & Portal Sign In' : 'Staff & VLE Registration'}
          </h3>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.82)',
              fontSize: '0.88rem',
              margin: 0,
            }}
          >
            {mode === 'signin'
              ? 'Select your role to access offline survey tools or management consoles.'
              : 'Create a Field Volunteer or Village Level Entrepreneur account to use the platform. Farmers are not app users — a volunteer records farmer details directly in the field.'}
          </p>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px 32px 32px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-green-subtle)',
                  color: 'var(--brand-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '1.6rem',
                }}
              >
                ✓
              </div>

              {mode === 'signin' ? (
                <>
                  <h4 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--brand-charcoal)' }}>
                    Connecting to {selectedRole.toUpperCase()} Portal...
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--brand-charcoal-muted)' }}>
                    Session token verified. Offline database sync queue initialized.
                  </p>
                </>
              ) : (
                <>
                  <h4 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--brand-charcoal)' }}>
                    Account Created Successfully!
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--brand-charcoal-muted)', lineHeight: 1.6 }}>
                    Welcome <strong>{registeredAccount?.name}</strong>. Your{' '}
                    <strong>{registeredAccount?.role?.toUpperCase()}</strong> account has been registered. You can now
                    sign in using your phone number and password.
                  </p>
                </>
              )}

              <button
                onClick={() => {
                  const role = selectedRole;
                  resetState();
                  onClose();
                  if (role === 'admin' && onEnterAdmin) {
                    onEnterAdmin();
                  }
                }}
                className="btn btn-primary"
                style={{ marginTop: '24px' }}
              >
                Continue to Platform
              </button>
            </div>
          ) : mode === 'signin' ? (
            /* ================= SIGN IN FORM ================= */
            <>
              {/* Role Switcher */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'var(--brand-bg)',
                  padding: '4px',
                  borderRadius: '4px',
                  marginBottom: '24px',
                  border: '1px solid var(--brand-border)',
                }}
              >
                {[
                  { id: 'volunteer', label: 'Volunteer' },
                  { id: 'admin', label: 'Admin Staff' },
                  { id: 'vle', label: 'VLE' },
                ].map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-heading)',
                        backgroundColor: isSelected ? 'var(--brand-green)' : 'transparent',
                        color: isSelected ? '#ffffff' : 'var(--brand-charcoal)',
                        borderRadius: '2px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {role.label}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                      color: 'var(--brand-charcoal)',
                    }}
                  >
                    Registered Mobile / Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid var(--brand-border)',
                      borderRadius: '2px',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--brand-green)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--brand-border)')}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                      color: 'var(--brand-charcoal)',
                    }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid var(--brand-border)',
                      borderRadius: '2px',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--brand-green)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--brand-border)')}
                  />
                </div>

                {formError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#fef2f2',
                      borderRadius: '2px',
                      fontSize: '0.82rem',
                      color: '#991b1b',
                      border: '1px solid #fecaca',
                    }}
                  >
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    padding: '14px',
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? 'wait' : 'pointer',
                  }}
                >
                  <span>{isSubmitting ? 'SIGNING IN…' : `SIGN IN AS ${selectedRole.toUpperCase()}`}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M14 7.3466L13.4268 6.61513L8.7769 0.693149L7.20269 2.15609L10.3915 6.21861L0.235849 6.21861L0.235849 8.47461L10.3915 8.47461L7.20269 12.5371L8.7769 14L13.4268 8.07803L14 7.3466Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </form>

              {/* If not registered, offer staff/VLE account registration (not a farmer intake form) */}
              <div
                style={{
                  marginTop: '22px',
                  paddingTop: '18px',
                  borderTop: '1px solid var(--brand-border)',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.92rem', color: 'var(--brand-charcoal-muted)' }}>
                  New volunteer, VLE, or admin staff?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-green)',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  Create an account →
                </button>
              </div>
            </>
          ) : (
            /* ================= ACCOUNT REGISTRATION FORM (Volunteer / VLE) ================= */
            <div>
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--brand-orange-subtle)',
                  borderRadius: '2px',
                  borderLeft: '3px solid var(--brand-orange)',
                  marginBottom: '20px',
                  fontSize: '0.84rem',
                  color: 'var(--brand-charcoal)',
                }}
              >
                🧭 <strong>Note:</strong> This creates a platform account for Field Volunteers, Village Level
                Entrepreneurs, and NGO Admin Staff. Farmers are recorded by a volunteer directly during a village
                visit and do not sign up here.
              </div>

              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'var(--brand-bg)',
                  padding: '4px',
                  borderRadius: '4px',
                  marginBottom: '20px',
                  border: '1px solid var(--brand-border)',
                }}
              >
                {[
                  { id: 'volunteer', label: 'Volunteer' },
                  { id: 'vle', label: 'VLE' },
                  { id: 'admin', label: 'Admin Staff' },
                ].map((role) => {
                  const isSelected = registerRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setRegisterRole(role.id)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-heading)',
                        backgroundColor: isSelected ? 'var(--brand-green)' : 'transparent',
                        color: isSelected ? '#ffffff' : 'var(--brand-charcoal)',
                        borderRadius: '2px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {role.label}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                      color: 'var(--brand-charcoal)',
                    }}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anjali Sharma"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--brand-border)',
                      borderRadius: '2px',
                      fontSize: '0.92rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                      color: 'var(--brand-charcoal)',
                    }}
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--brand-border)',
                      borderRadius: '2px',
                      fontSize: '0.92rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                      color: 'var(--brand-charcoal)',
                    }}
                  >
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid var(--brand-border)',
                      borderRadius: '2px',
                      fontSize: '0.92rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                </div>

                {formError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#fef2f2',
                      borderRadius: '2px',
                      fontSize: '0.82rem',
                      color: '#991b1b',
                      border: '1px solid #fecaca',
                    }}
                  >
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '14px',
                    backgroundColor: 'var(--brand-green)',
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? 'wait' : 'pointer',
                  }}
                >
                  <span>{isSubmitting ? 'CREATING ACCOUNT…' : `CREATE ${registerRole.toUpperCase()} ACCOUNT`}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M14 7.3466L13.4268 6.61513L8.7769 0.693149L7.20269 2.15609L10.3915 6.21861L0.235849 6.21861L0.235849 8.47461L10.3915 8.47461L7.20269 12.5371L8.7769 14L13.4268 8.07803L14 7.3466Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </form>

              <div
                style={{
                  marginTop: '18px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--brand-border)',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.9rem', color: 'var(--brand-charcoal-muted)' }}>
                  Already have an account?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-green)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  Sign In Here
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
