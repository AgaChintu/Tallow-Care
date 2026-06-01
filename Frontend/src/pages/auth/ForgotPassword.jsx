import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/authAPI';

// ── Step constants ──────────────────────────────────
const STEP = {
  EMAIL: 1,
  OTP: 2,
  RESET: 3,
};

// ── OTP Input (identical to Signup.jsx) ────────────
function OTPInput({ value, onChange, disabled }) {
  const refs = useRef([]);
  const digits = value.split('');

  const handleKey = (idx, e) => {
    if (e.key === 'Backspace') {
      if (digits[idx]) {
        const next = [...digits];
        next[idx] = '';
        onChange(next.join(''));
      } else if (idx > 0) {
        refs.current[idx - 1]?.focus();
      }
    }
  };

  const handleChange = (idx, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = char;
    onChange(next.join('').padEnd(6, '').slice(0, 6).trimEnd());
    if (char && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
  };

  return (
    <div className="otp-boxes-new">
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (refs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx] || ''}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKey(idx, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="otp-box-new"
          aria-label={`Reset code digit ${idx + 1}`}
        />
      ))}
    </div>
  );
}

// ── Eye icon helpers ────────────────────────────────
function EyeOff() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function EyeOn() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// ── Main ForgotPassword Component ───────────────────
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  const [step, setStep] = useState(STEP.EMAIL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1 state
  const [email, setEmail] = useState('');

  // Step 2 state
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 3 state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Resend cooldown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  // ── Step 1: Send reset code ──────────────────────
  const handleSendCode = async (e) => {
    e?.preventDefault();
    clearMessages();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) return setError('Please enter your email address.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
      return setError('Please enter a valid email address.');

    setLoading(true);
    try {
      const { data } = await authAPI.forgotPassword(trimmedEmail);
      if (data.success) {
        setSuccess(data.message);
        setStep(STEP.OTP);
        setResendCooldown(60);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ───────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    clearMessages();

    if (otp.replace(/\s/g, '').length < 6)
      return setError('Please enter the complete 6-digit code.');

    setLoading(true);
    try {
      const { data } = await authAPI.verifyResetOtp(email.trim(), otp.trim());
      if (data.success) {
        setSuccess(data.message);
        setStep(STEP.RESET);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset password ───────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (newPassword.length < 8)
      return setError('Password must be at least 8 characters.');
    if (newPassword !== confirmPassword)
      return setError('Passwords do not match.');

    setLoading(true);
    try {
      const { data } = await authAPI.resetPassword(email.trim(), otp.trim(), newPassword);
      if (data.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login', { replace: true }), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepMeta = {
    [STEP.EMAIL]: {
      title: 'Forgot password?',
      sub: 'Enter your email and we\'ll send a reset code.',
    },
    [STEP.OTP]: {
      title: 'Enter reset code',
      sub: `Step 2 of 3 — Check your inbox at ${email}`,
    },
    [STEP.RESET]: {
      title: 'Reset password',
      sub: 'Step 3 of 3 — Choose a strong new password.',
    },
  };

  const passwordsMatch = confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword && newPassword !== confirmPassword;

  return (
    <div className="auth-split-page">
      {/* LEFT — hero image panel */}
      <div className="auth-split-left">
        <div className="auth-split-overlay" />
      </div>

      {/* RIGHT — form panel */}
      <div className="auth-split-right">
        <div className={`auth-form-panel${mounted ? ' auth-form-panel--in' : ''}`}>

          {/* Header */}
          <div className="auth-form-header">
            <h1 className="auth-split-title">{stepMeta[step].title}</h1>
            <p className="auth-split-subtitle">{stepMeta[step].sub}</p>
          </div>

          {/* Step progress dots */}
          <div className="auth-step-dots">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`auth-dot${step === s ? ' auth-dot--active' : ''}${step > s ? ' auth-dot--done' : ''}`}
              />
            ))}
          </div>

          {/* ── STEP 1: Email ── */}
          {step === STEP.EMAIL && (
            <form onSubmit={handleSendCode} className="auth-split-form" noValidate>
              <div className="auth-field">
                <label className="auth-label">Email Address</label>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                  required
                  autoFocus
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              {error && <ErrorMsg>{error}</ErrorMsg>}

              <button type="submit" className="auth-primary-btn" disabled={loading}>
                {loading ? <LoadingSpinner /> : 'Send Reset Code'}
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === STEP.OTP && (
            <form onSubmit={handleVerifyOTP} className="auth-split-form">
              <p className="otp-hint-text">
                We sent a 6-digit code to <strong>{email}</strong>
              </p>

              <OTPInput value={otp} onChange={setOtp} disabled={loading} />

              {error && <ErrorMsg>{error}</ErrorMsg>}
              {success && (
                <div className="auth-success-msg">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {success}
                </div>
              )}

              <div className="auth-row-actions">
                <button
                  type="button"
                  className="auth-back-btn"
                  onClick={() => { setStep(STEP.EMAIL); setOtp(''); clearMessages(); }}
                  disabled={loading}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="auth-primary-btn auth-primary-btn--flex"
                  disabled={loading || otp.length < 6}
                >
                  {loading ? <LoadingSpinner /> : 'Verify Code'}
                </button>
              </div>

              {/* Resend row */}
              <div className="otp-resend-row">
                {resendCooldown > 0 ? (
                  <span className="resend-timer">Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    className="resend-btn-new"
                    onClick={() => { setOtp(''); clearMessages(); handleSendCode(); }}
                    disabled={loading}
                  >
                    Resend code
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === STEP.RESET && (
            <form onSubmit={handleResetPassword} className="auth-split-form" noValidate>
              {/* New Password */}
              <div className="auth-field">
                <label className="auth-label">New Password</label>
                <div className="auth-input-wrap">
                  <input
                    className="auth-input"
                    type={showNewPass ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); clearMessages(); }}
                    required
                    autoFocus
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowNewPass(!showNewPass)}
                    tabIndex={-1}
                    aria-label={showNewPass ? 'Hide password' : 'Show password'}
                  >
                    {showNewPass ? <EyeOff /> : <EyeOn />}
                  </button>
                </div>
                {newPassword && <PasswordStrength password={newPassword} />}
              </div>

              {/* Confirm Password */}
              <div className="auth-field">
                <label className="auth-label">Confirm Password</label>
                <div className="auth-input-wrap">
                  <input
                    className="auth-input"
                    type={showConfirmPass ? 'text' : 'password'}
                    placeholder="Repeat your new password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); clearMessages(); }}
                    required
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    tabIndex={-1}
                    aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPass ? <EyeOff /> : <EyeOn />}
                  </button>
                </div>
                {/* Inline match indicator */}
                {confirmPassword && (
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      marginTop: '4px',
                      display: 'block',
                      color: passwordsMatch ? '#4a7c59' : '#c0392b',
                    }}
                  >
                    {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </span>
                )}
              </div>

              {error && <ErrorMsg>{error}</ErrorMsg>}
              {success && (
                <div className="auth-success-msg">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="auth-primary-btn"
                disabled={loading || newPassword.length < 8 || passwordsMismatch || !confirmPassword}
              >
                {loading ? <LoadingSpinner /> : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="auth-switch-link">
            Remember your password?{' '}
            <Link to="/login">Sign in</Link>
          </p>

        </div>
      </div>
    </div>
  );
}

// ── Shared helpers (mirrors Signup.jsx) ─────────────

function ErrorMsg({ children }) {
  return (
    <div className="auth-error-msg">
      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      {children}
    </div>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#f0a07a', '#f5d76e', '#8aaa7a', '#4a7c59'];

  return (
    <div className="pw-strength">
      <div className="pw-bars">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="pw-bar"
            style={{ background: i < strength ? colors[strength - 1] : '#e8ddd0' }}
          />
        ))}
      </div>
      {strength > 0 && (
        <span style={{ color: colors[strength - 1], fontSize: '0.74rem', fontWeight: 600 }}>
          {labels[strength - 1]}
        </span>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <span className="btn-spinner">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    </span>
  );
}
