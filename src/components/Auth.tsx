'use client';

import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthAnimatedPanel } from '@/components/auth/AuthAnimatedPanel';
import { AuthCopyTransition, type AuthCopySlide } from '@/components/auth/AuthCopyTransition';
import { AuthPlainField } from '@/components/auth/AuthFormSection';
import { AuthFooterHint } from '@/components/auth/AuthFooterHint';
import { MindTuneShell } from '@/components/MindTuneShell';
import { SiteFooter } from '@/components/SiteFooter';
import { getSupabaseClient, signInWithGoogle } from '@/lib/client/supabase';

function GoogleMark() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function Auth({
  onLogin,
  onLogoClick,
  initialMode = 'login',
}: {
  onLogin: () => void;
  onLogoClick?: () => void;
  initialMode?: 'login' | 'signup';
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [copySlide, setCopySlide] = useState<AuthCopySlide>(null);

  const authPanelKey = mode === 'forgot_password' ? 'forgot_password' : 'credentials';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') !== 'signup_required') return;
    setError('No account found for that sign-in. Create an account first.');
    setMode('signup');
    params.delete('error');
    const qs = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
  }, []);

  const switchMode = (next: 'login' | 'signup' | 'forgot_password') => {
    const keepEmail =
      (mode === 'login' && (next === 'signup' || next === 'forgot_password')) ||
      (mode === 'signup' && next === 'login') ||
      (mode === 'forgot_password' && next === 'login');

    if (mode === 'login' && next === 'signup') setCopySlide('right');
    else if (mode === 'signup' && next === 'login') setCopySlide('left');
    else if (mode === 'login' && next === 'forgot_password') setCopySlide('right');
    else if (mode === 'forgot_password' && next === 'login') setCopySlide('left');
    else setCopySlide(null);

    setMode(next);
    setError(null);
    setMessage(null);
    if (!keepEmail) setEmail('');
    setPassword('');
    if (next !== 'signup') {
      setFirstName('');
      setLastName('');
      setTermsAccepted(false);
    }
    setShowPassword(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase client not initialized');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        });
        if (error) throw error;
        setMessage('If an account exists for this email, you will receive a password reset link.');
      } else if (mode === 'signup') {
        const trimmedFirst = firstName.trim();
        const trimmedLast = lastName.trim();
        if (!trimmedFirst || !trimmedLast) {
          setError('Please enter your first and last name.');
          setLoading(false);
          return;
        }
        if (!termsAccepted) {
          setError('Please agree to the Terms & Conditions to continue.');
          setLoading(false);
          return;
        }
        const trimmedUsername = `${trimmedFirst} ${trimmedLast}`.trim();
        if (trimmedUsername.length < 3) {
          setError('Name must be at least 3 characters.');
          setLoading(false);
          return;
        }

        const { data: existing } = await supabase
          .from('personal_info')
          .select('id')
          .ilike('username', trimmedUsername)
          .maybeSingle();
        if (existing) {
          setError('That name is already taken. Try a variation or contact support.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: trimmedUsername, first_name: trimmedFirst, last_name: trimmedLast } },
        });
        if (error) throw error;

        if (data.session) {
          onLogin();
        } else if (data.user && data.user.identities && data.user.identities.length === 0) {
          setError('User already exists. Please login instead.');
          switchMode('login');
        } else {
          setMessage('Check your email for the confirmation link!');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLogin();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      if (msg === 'Failed to fetch')
        setError('Connection failed. Please check your internet or if the Supabase project is active.');
      else if (msg.toLowerCase().includes('invalid login credentials'))
        setError('Incorrect email or password. Please try again, or use "Forgot password?" to reset it.');
      else if (msg.toLowerCase().includes('email not confirmed'))
        setError('Please confirm your email before logging in. Check your inbox for a confirmation link.');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    const intent = mode === 'signup' ? 'signup' : 'login';
    const { error: oauthError } = await signInWithGoogle(intent);
    if (oauthError) {
      setError(oauthError);
      setLoading(false);
    }
  };

  const title = mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create an account' : 'Reset password';
  const subtitle =
    mode === 'login'
      ? 'Log in to open your library and recent runs.'
      : mode === 'signup'
        ? 'Start tuning prompts in under a minute.'
        : 'We will email you a reset link.';

  const logo = onLogoClick ? (
    <button type="button" onClick={onLogoClick} className="auth-center-logo">
      MindTune
    </button>
  ) : (
    <Link href="/welcome" className="auth-center-logo">
      MindTune
    </Link>
  );

  return (
    <MindTuneShell className="auth-shell auth-center-shell landing-page">
      <div className="landing-hero-beams pointer-events-none fixed inset-0 z-0" aria-hidden />
      <div className="landing-hero-vignette pointer-events-none fixed inset-0 z-0" aria-hidden />
      <div
        className="landing-ambient-orb -left-40 top-24 h-[32rem] w-[32rem] bg-sky-500/10"
        aria-hidden
      />
      <div
        className="landing-ambient-orb -right-32 top-[38%] h-[26rem] w-[26rem] bg-sky-400/6"
        aria-hidden
      />

      <div className="auth-center-page relative z-10">
        <div className="auth-center-scroll">
          <div className="auth-center-inner">
            <div className="auth-center-brand">{logo}</div>

            <div className="landing-panel landing-panel-elevated auth-center-card">
            <AuthAnimatedPanel
              panelKey={authPanelKey}
              motion={authPanelKey === 'forgot_password' ? 'neutral' : mode === 'signup' ? 'signup' : 'login'}
            >
              {mode === 'forgot_password' ? (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="auth-back-link mb-5 inline-flex text-sm font-medium text-sky-400 hover:text-sky-300"
                >
                  ← Back to log in
                </button>
              ) : null}

              <AuthCopyTransition
                copyKey={`${mode}-${title}`}
                slide={copySlide}
                title={title}
                subtitle={subtitle}
                compact
              />

              {mode !== 'forgot_password' ? (
                <AuthFooterHint
                  mode={mode}
                  className="auth-mode-switch mt-2.5 mb-8"
                  onSwitch={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                />
              ) : (
                <p className="auth-mode-switch mb-8 mt-2.5 text-sm text-zinc-500">{subtitle}</p>
              )}

              <form className="auth-center-form" onSubmit={handleAuth}>
                {mode === 'signup' ? (
                  <div className="auth-name-row">
                    <AuthPlainField
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                    />
                    <AuthPlainField
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                ) : null}

                <AuthPlainField
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                />

                {mode !== 'forgot_password' ? (
                  <div className="auth-plain-field">
                    {mode === 'login' ? (
                      <div className="auth-forgot-row">
                        <button
                          type="button"
                          onClick={() => switchMode('forgot_password')}
                          className="text-xs font-medium text-sky-400/90 transition hover:text-sky-300"
                        >
                          Forgot password?
                        </button>
                      </div>
                    ) : null}
                    <div className="auth-plain-control">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="auth-plain-input pr-11"
                        placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="auth-plain-toggle"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ) : null}

                {mode === 'signup' ? (
                  <label className="auth-terms">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="auth-terms-checkbox"
                    />
                    <span>
                      I agree to the{' '}
                      <Link href="/terms" className="auth-inline-link underline-offset-2 hover:underline">
                        Terms &amp; Conditions
                      </Link>
                    </span>
                  </label>
                ) : null}

                {error ? (
                  <div className="auth-alert auth-alert-error rounded-xl border border-rose-900/50 bg-rose-950/40 px-3.5 py-3 text-sm text-rose-200">
                    {error}
                  </div>
                ) : null}
                {message ? (
                  <div className="auth-alert auth-alert-success rounded-xl border border-emerald-900/50 bg-emerald-950/40 px-3.5 py-3 text-sm text-emerald-200">
                    {message}
                  </div>
                ) : null}

                <button type="submit" disabled={loading} className="landing-btn-primary auth-center-submit w-full">
                  {loading
                    ? 'Processing…'
                    : mode === 'login'
                      ? 'Log in'
                      : mode === 'signup'
                        ? 'Create account'
                        : 'Send reset link'}
                </button>
              </form>

              {mode !== 'forgot_password' ? (
                <>
                  <div className="auth-social-divider" role="separator">
                    <span>or continue with</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleGoogle()}
                    disabled={loading}
                    className="auth-google-btn"
                  >
                    <GoogleMark />
                    Continue with Google
                  </button>
                </>
              ) : null}
            </AuthAnimatedPanel>
            </div>
          </div>
        </div>

        <SiteFooter
          containerClassName="landing-content-full max-w-none px-0"
          className="auth-site-footer auth-center-footer border-zinc-800/80 bg-transparent px-4 text-zinc-500 lg:px-0 [&_a:hover]:text-zinc-200"
        />
      </div>
    </MindTuneShell>
  );
}
