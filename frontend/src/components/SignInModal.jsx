import { useState } from 'react';

export default function SignInModal({ isOpen, onClose, onEnterAdmin, initialRole = 'admin' }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'farmer-register'
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Farmer Registration Fields
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [farmerVillage, setFarmerVillage] = useState('');
  const [farmerLandSize, setFarmerLandSize] = useState('');
  const [farmerCrops, setFarmerCrops] = useState('');
  const [farmerMachineryNeed, setFarmerMachineryNeed] = useState('');
  
  const [submitted, setSubmitted] = useState(false);
  const [registeredFarmer, setRegisteredFarmer] = useState(null);

  if (!isOpen) return null;

  const handleAutoFillAdmin = () => {
    setSelectedRole('admin');
    setPhone('admin@reachingroots.org');
    setPassword('admin');
    setAuthError('');
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    setAuthError('');

    if (selectedRole === 'admin') {
      const cleanPhone = phone.trim().toLowerCase();
      const cleanPass = password.trim();

      // Check mock credentials: accepts admin email or mobile and valid password
      const isMockValid = 
        (cleanPhone === 'admin@reachingroots.org' || cleanPhone === '+91 98765 43210' || cleanPhone === 'admin' || cleanPhone === '9876543210') &&
        (cleanPass === 'admin' || cleanPass === 'roots@2026' || cleanPass === 'admin123');

      if (!isMockValid && cleanPass !== 'admin') {
        setAuthError('Invalid admin credentials. Use the mock credentials provided below.');
        return;
      }

      setIsAuthenticating(true);
      setTimeout(() => {
        setIsAuthenticating(false);
        onClose();
        if (onEnterAdmin) {
          onEnterAdmin();
        }
      }, 500);
      return;
    }

    setSubmitted(true);
  };

  const handleFarmerRegister = (e) => {
    e.preventDefault();
    setRegisteredFarmer({
      name: farmerName,
      phone: farmerPhone,
      village: farmerVillage,
      landSize: farmerLandSize,
      crops: farmerCrops,
      need: farmerMachineryNeed,
    });
    setSubmitted(true);
  };

  const resetState = () => {
    setSubmitted(false);
    setRegisteredFarmer(null);
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
            {mode === 'signin' ? 'Platform Access & Portal Sign In' : 'Farmer Registration'}
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
              : 'Register your farm to request subsidized equipment rentals and indigenous crop support.'}
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
                    Farmer Profile Registered Successfully!
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--brand-charcoal-muted)', lineHeight: 1.6 }}>
                    Welcome <strong>{registeredFarmer?.name}</strong> from village{' '}
                    <strong>{registeredFarmer?.village}</strong>. Your {registeredFarmer?.landSize} acre farm record has been added to our offline registry. A local VLE or field volunteer will contact you regarding machinery availability.
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

                {authError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#FEE2E2',
                      borderLeft: '3px solid #EF4444',
                      borderRadius: '2px',
                      color: '#991B1B',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    ⚠️ {authError}
                  </div>
                )}

                {selectedRole === 'admin' ? (
                  <div
                    style={{
                      padding: '14px 16px',
                      backgroundColor: 'var(--brand-bg)',
                      border: '1px solid var(--brand-border)',
                      borderLeft: '4px solid var(--brand-orange)',
                      borderRadius: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--brand-orange)', letterSpacing: '0.05em' }}>
                        🔑 Mock Admin Staff Credentials
                      </span>
                      <button
                        type="button"
                        onClick={handleAutoFillAdmin}
                        style={{
                          background: 'var(--brand-orange)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '3px',
                          padding: '4px 8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ⚡ Auto-Fill
                      </button>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--brand-charcoal)', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px' }}>
                      <strong>Username:</strong>
                      <code>admin@reachingroots.org</code>
                      <strong>Password:</strong>
                      <code>admin</code>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '10px 14px',
                      backgroundColor: 'var(--brand-green-subtle)',
                      borderRadius: '2px',
                      fontSize: '0.82rem',
                      color: 'var(--brand-green-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>💡</span>
                    <span>Demo Mode: Enter any credentials to launch the {selectedRole.toUpperCase()} console.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    padding: '14px',
                    opacity: isAuthenticating ? 0.7 : 1,
                  }}
                >
                  <span>{isAuthenticating ? 'AUTHENTICATING STAFF...' : `SIGN IN AS ${selectedRole.toUpperCase()}`}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M14 7.3466L13.4268 6.61513L8.7769 0.693149L7.20269 2.15609L10.3915 6.21861L0.235849 6.21861L0.235849 8.47461L10.3915 8.47461L7.20269 12.5371L8.7769 14L13.4268 8.07803L14 7.3466Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </form>

              {/* Requirement 2: If not registered, provide registration for farmer */}
              <div
                style={{
                  marginTop: '22px',
                  paddingTop: '18px',
                  borderTop: '1px solid var(--brand-border)',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.92rem', color: 'var(--brand-charcoal-muted)' }}>
                  Not registered on the platform?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => setMode('farmer-register')}
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
                  Register as a Farmer →
                </button>
              </div>
            </>
          ) : (
            /* ================= FARMER REGISTRATION FORM ================= */
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
                🌾 <strong>Farmer Enrollment:</strong> Join over 10 Lakh farmers accessing subsidized machinery and indigenous crop programs across Madhya Pradesh.
              </div>

              <form onSubmit={handleFarmerRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                    Farmer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar Patel"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                      value={farmerPhone}
                      onChange={(e) => setFarmerPhone(e.target.value)}
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
                      Village / Hamlet *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ratapani Khurd"
                      value={farmerVillage}
                      onChange={(e) => setFarmerVillage(e.target.value)}
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
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                      Land Size (Acres) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      placeholder="e.g. 3.5"
                      value={farmerLandSize}
                      onChange={(e) => setFarmerLandSize(e.target.value)}
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
                      Major Crops Grown *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Khapli Wheat, Millets"
                      value={farmerCrops}
                      onChange={(e) => setFarmerCrops(e.target.value)}
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
                    Requested Machinery / Farming Needs (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Power Weeder, Seed Drill, Harvester"
                    value={farmerMachineryNeed}
                    onChange={(e) => setFarmerMachineryNeed(e.target.value)}
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

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '14px',
                    backgroundColor: 'var(--brand-green)',
                  }}
                >
                  <span>REGISTER AS FARMER</span>
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
                  Already have a volunteer or staff account?{' '}
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
