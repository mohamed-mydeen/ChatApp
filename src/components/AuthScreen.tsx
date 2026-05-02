/**
 * AuthScreen.tsx
 * Multi-step onboarding flow:
 *   splash → (login: credentials) | (register: username → credentials → email → done)
 *
 * Design: Apple/WhatsApp production-style. Clean, minimal, no gradients.
 * 8px spacing grid · Inter font · Consistent border-radius (12px) · One action per screen.
 */

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Check, MessageSquareCode, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// ─── Transition Preset ────────────────────────────────────────────────────────
const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -24 },
  transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
};

// ─── Shared Input Component ───────────────────────────────────────────────────
function AuthInput({
  id, type, value, onChange, placeholder, autoFocus, rightElement, error,
}: {
  id: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  rightElement?: React.ReactNode;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <div
        className="relative flex items-center"
        style={{
          borderRadius: 12,
          border: `1.5px solid ${error ? '#ef4444' : focused ? '#00a884' : 'var(--auth-border)'}`,
          background: 'var(--auth-input-bg)',
          transition: 'border-color 0.15s ease',
        }}
      >
        <input
          id={id}
          type={type}
          value={value}
          autoFocus={autoFocus}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 bg-transparent text-[15px] leading-none outline-none px-4 py-[14px] text-[var(--auth-text)] placeholder-[var(--auth-placeholder)]"
          style={{ fontFamily: 'inherit' }}
        />
        {rightElement && (
          <div className="pr-3 flex-shrink-0">{rightElement}</div>
        )}
      </div>
      {error && (
        <p className="text-[12px] text-red-500 px-1" role="alert">{error}</p>
      )}
    </div>
  );
}

// ─── Primary Button ───────────────────────────────────────────────────────────
function PrimaryButton({
  children, onClick, loading, disabled, type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full rounded-[12px] py-[14px] text-[15px] font-semibold text-white transition-opacity active:opacity-80"
      style={{
        background: '#00a884',
        opacity: disabled || loading ? 0.55 : 1,
        letterSpacing: '-0.01em',
      }}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Please wait…
        </span>
      ) : children}
    </button>
  );
}

// ─── Step Progress Dots ───────────────────────────────────────────────────────
function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 18 : 6,
            height: 6,
            borderRadius: 99,
            background: i === current ? '#00a884' : 'var(--auth-dot)',
            transition: 'all 0.2s ease',
          }}
        />
      ))}
    </div>
  );
}

// ─── App Logo ─────────────────────────────────────────────────────────────────
function AppLogo({ size = 48 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-[14px]"
      style={{
        width: size,
        height: size,
        background: '#00a884',
        flexShrink: 0,
      }}
    >
      <MessageSquareCode size={size * 0.5} color="white" strokeWidth={2} />
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="text-[13px] px-4 py-3 rounded-[10px] text-red-700 dark:text-red-400"
      style={{ background: 'var(--auth-error-bg)' }}
      role="alert"
    >
      {message}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type Mode = 'login' | 'register';
// Register steps: 0=username, 1=credentials, 2=email, 3=done
// Login steps: 0=credentials

export default function AuthScreen({ onLoginSuccess }: { onLoginSuccess: (userId: string) => void }) {
  const { login, register, loading, error, clearError } = useAuth();

  // ── Phase: splash → auth ─────────────────────────────────────────────────
  const [phase, setPhase] = useState<'splash' | 'auth'>('splash');
  useEffect(() => {
    const t = setTimeout(() => setPhase('auth'), 1400);
    return () => clearTimeout(t);
  }, []);

  // ── Auth mode & step ─────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState(0);

  // ── Form fields ──────────────────────────────────────────────────────────
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone]       = useState('');
  const [showPass, setShowPass] = useState(false);

  // ── Field-level validation ───────────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearAll = () => {
    clearError();
    setFieldErrors({});
  };

  const switchMode = (m: Mode) => {
    clearAll();
    setStep(0);
    setMode(m);
  };

  const goBack = () => {
    clearAll();
    setStep(s => Math.max(0, s - 1));
  };

  // ── Validate & Advance ───────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (mode === 'register') {
      if (step === 0 && !username.trim()) errs.username = 'Username is required.';
      if (step === 1) {
        if (!password || password.length < 6) errs.password = 'At least 6 characters.';
      }
      if (step === 2 && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
        errs.email = 'Enter a valid email address.';
      }
    } else {
      if (!email) errs.email = 'Email is required.';
      if (!password) errs.password = 'Password is required.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    clearAll();

    if (mode === 'login') {
      // Single step — submit
      const user = await login(email, password);
      if (user?._id) onLoginSuccess(user._id);
      return;
    }

    // Register multi-step
    if (step < 2) {
      setStep(s => s + 1);
      return;
    }
    // Final step — submit
    const user = await register(username, email, password);
    if (user?._id) {
      setStep(3); // done screen
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SPLASH
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'splash') {
    return (
      <motion.div
        key="splash"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full w-full flex flex-col items-center justify-center bg-[var(--auth-bg)]"
      >
        <AppLogo size={56} />
        <p
          className="mt-4 text-[22px] font-semibold tracking-tight text-[var(--auth-text)]"
          style={{ letterSpacing: '-0.02em' }}
        >
          CipherChat
        </p>
      </motion.div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AUTH SHELL
  // ─────────────────────────────────────────────────────────────────────────
  const totalRegisterSteps = 3; // 0,1,2 (done=3 is outside progress)

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[var(--auth-bg)] px-6">
      {/* ── CSS tokens (inline, avoids global pollution) ────────────────────── */}
      <style>{`
        :root {
          --auth-bg:          #f9fafb;
          --auth-text:        #111827;
          --auth-subtext:     #6b7280;
          --auth-border:      #d1d5db;
          --auth-input-bg:    #ffffff;
          --auth-placeholder: #9ca3af;
          --auth-dot:         #d1d5db;
          --auth-error-bg:    #fef2f2;
          --auth-card-bg:     #ffffff;
        }
        .dark {
          --auth-bg:          #0b141a;
          --auth-text:        #e9edef;
          --auth-subtext:     #8696a0;
          --auth-border:      #374151;
          --auth-input-bg:    #1f2c34;
          --auth-placeholder: #4b5563;
          --auth-dot:         #374151;
          --auth-error-bg:    #2d1515;
          --auth-card-bg:     #1f2c34;
        }
      `}</style>

      {/* ── Card ─────────────────────────────────────────────────────────────── */}
      <div
        className="w-full"
        style={{ maxWidth: 400 }}
      >
        {/* Back button (register steps > 0) */}
        <div className="h-10 mb-2 flex items-center">
          {mode === 'register' && step > 0 && step < 3 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={goBack}
              className="flex items-center gap-1.5 text-[14px] text-[var(--auth-subtext)] hover:text-[var(--auth-text)] transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </motion.button>
          )}
        </div>

        {/* Progress dots (register only) */}
        {mode === 'register' && step < 3 && (
          <StepDots total={totalRegisterSteps} current={step} />
        )}

        {/* ── Animated step content ─────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {/* ────────────────────────────────────────────────────────────────── */}
          {/* LOGIN ─ single screen                                              */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {mode === 'login' && (
            <motion.div key="login" {...slide} className="space-y-6">
              {/* Header */}
              <div className="space-y-1 mb-8">
                <div className="mb-5"><AppLogo size={40} /></div>
                <h1
                  className="text-[26px] font-semibold text-[var(--auth-text)]"
                  style={{ letterSpacing: '-0.025em' }}
                >
                  Sign in
                </h1>
                <p className="text-[14px] text-[var(--auth-subtext)]">
                  Welcome back to CipherChat
                </p>
              </div>

              {error && <ErrorBanner message={error} />}

              <div className="space-y-3">
                <AuthInput
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="Email address"
                  autoFocus
                  error={fieldErrors.email}
                />
                <AuthInput
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  placeholder="Password"
                  error={fieldErrors.password}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPass(p => !p)}
                      className="text-[var(--auth-placeholder)] hover:text-[var(--auth-subtext)] transition-colors"
                      tabIndex={-1}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />
              </div>

              <PrimaryButton onClick={handleContinue} loading={loading}>
                Sign in
              </PrimaryButton>

              <p className="text-center text-[13px] text-[var(--auth-subtext)]">
                No account?{' '}
                <button
                  onClick={() => switchMode('register')}
                  className="font-semibold text-[#00a884] hover:underline underline-offset-2"
                >
                  Create one
                </button>
              </p>
            </motion.div>
          )}

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* REGISTER ─ STEP 0 · Username                                       */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {mode === 'register' && step === 0 && (
            <motion.div key="reg-0" {...slide} className="space-y-6">
              <div className="space-y-1 mb-8">
                <div className="mb-5"><AppLogo size={40} /></div>
                <h1
                  className="text-[26px] font-semibold text-[var(--auth-text)]"
                  style={{ letterSpacing: '-0.025em' }}
                >
                  Create account
                </h1>
                <p className="text-[14px] text-[var(--auth-subtext)]">
                  Start with a username
                </p>
              </div>

              {error && <ErrorBanner message={error} />}

              <AuthInput
                id="reg-username"
                type="text"
                value={username}
                onChange={setUsername}
                placeholder="Username"
                autoFocus
                error={fieldErrors.username}
              />

              <PrimaryButton onClick={handleContinue} disabled={!username.trim()}>
                Continue
              </PrimaryButton>

              <p className="text-center text-[13px] text-[var(--auth-subtext)]">
                Already have an account?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="font-semibold text-[#00a884] hover:underline underline-offset-2"
                >
                  Sign in
                </button>
              </p>
            </motion.div>
          )}

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* REGISTER ─ STEP 1 · Phone + Password                              */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {mode === 'register' && step === 1 && (
            <motion.div key="reg-1" {...slide} className="space-y-6">
              <div className="space-y-1 mb-8">
                <h1
                  className="text-[26px] font-semibold text-[var(--auth-text)]"
                  style={{ letterSpacing: '-0.025em' }}
                >
                  Your credentials
                </h1>
                <p className="text-[14px] text-[var(--auth-subtext)]">
                  Set a phone number and password
                </p>
              </div>

              {error && <ErrorBanner message={error} />}

              <div className="space-y-3">
                <AuthInput
                  id="reg-phone"
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  placeholder="Phone number (optional)"
                  autoFocus
                  error={fieldErrors.phone}
                />
                <AuthInput
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  placeholder="Password"
                  error={fieldErrors.password}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPass(p => !p)}
                      className="text-[var(--auth-placeholder)] hover:text-[var(--auth-subtext)] transition-colors"
                      tabIndex={-1}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />
              </div>
              {password && (
                <div className="flex gap-1 mt-1">
                  {[2, 4, 6, 8].map(n => (
                    <div
                      key={n}
                      className="flex-1 h-[3px] rounded-full transition-colors duration-200"
                      style={{
                        background: password.length >= n
                          ? password.length >= 8 ? '#00a884' : password.length >= 6 ? '#f59e0b' : '#ef4444'
                          : 'var(--auth-border)',
                      }}
                    />
                  ))}
                </div>
              )}

              <PrimaryButton onClick={handleContinue} loading={loading} disabled={!password}>
                Continue
              </PrimaryButton>
            </motion.div>
          )}

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* REGISTER ─ STEP 2 · Email                                          */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {mode === 'register' && step === 2 && (
            <motion.div key="reg-2" {...slide} className="space-y-6">
              <div className="space-y-1 mb-8">
                <h1
                  className="text-[26px] font-semibold text-[var(--auth-text)]"
                  style={{ letterSpacing: '-0.025em' }}
                >
                  Add your email
                </h1>
                <p className="text-[14px] text-[var(--auth-subtext)]">
                  Used to recover your account
                </p>
              </div>

              {error && <ErrorBanner message={error} />}

              <AuthInput
                id="reg-email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Email address"
                autoFocus
                error={fieldErrors.email}
              />

              <PrimaryButton onClick={handleContinue} loading={loading} disabled={!email.trim()}>
                Create account
              </PrimaryButton>
            </motion.div>
          )}

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* REGISTER ─ DONE                                                    */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {mode === 'register' && step === 3 && (
            <motion.div
              key="reg-done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="text-center space-y-8 py-4"
            >
              {/* Animated check circle */}
              <motion.div
                className="flex justify-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: '#00a884' }}
                >
                  <motion.div
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.4, ease: 'easeOut' }}
                  >
                    <Check size={36} color="white" strokeWidth={3} />
                  </motion.div>
                </div>
              </motion.div>

              {/* Text */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <h1
                  className="text-[28px] font-semibold text-[var(--auth-text)]"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  You're all set 🎉
                </h1>
                <p className="text-[15px] text-[var(--auth-subtext)]">
                  Welcome to CipherChat, <strong>{username}</strong>.
                </p>
                <p className="text-[13px] text-[var(--auth-subtext)] opacity-70">
                  Your account is ready. Start chatting securely.
                </p>
              </motion.div>

              {/* Enter Chat button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <PrimaryButton onClick={async () => {
                  const user = await login(email, password);
                  if (user?._id) onLoginSuccess(user._id);
                }} loading={loading}>
                  Enter Chat →
                </PrimaryButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
