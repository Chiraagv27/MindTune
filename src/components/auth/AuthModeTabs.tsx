'use client';

interface AuthModeTabsProps {
  mode: 'login' | 'signup';
  onLogin: () => void;
  onSignUp: () => void;
  className?: string;
}

export function AuthModeTabs({ mode, onLogin, onSignUp, className = 'mt-6' }: AuthModeTabsProps) {
  return (
    <div className={`auth-mode-tabs ${className}`} role="tablist" aria-label="Authentication mode">
      <span
        key={mode}
        className={[
          'auth-mode-tabs-indicator',
          'auth-mode-tabs-indicator-pulse',
          mode === 'signup' ? 'auth-mode-tabs-indicator-right' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden
      />
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'login'}
        className={`auth-mode-tab ${mode === 'login' ? 'auth-mode-tab-active' : ''}`}
        onClick={onLogin}
      >
        Log in
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'signup'}
        className={`auth-mode-tab ${mode === 'signup' ? 'auth-mode-tab-active' : ''}`}
        onClick={onSignUp}
      >
        Sign up
      </button>
    </div>
  );
}
