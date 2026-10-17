'use client';

interface AuthFooterHintProps {
  mode: 'login' | 'signup';
  onSwitch: () => void;
  className?: string;
}

export function AuthFooterHint({ mode, onSwitch, className = '' }: AuthFooterHintProps) {
  return (
    <p key={mode} className={`auth-footer-animate text-sm text-zinc-500 ${className}`}>
      {mode === 'login' ? (
        <>
          Don&apos;t have an account?{' '}
          <button type="button" onClick={onSwitch} className="auth-inline-link font-medium underline-offset-2 hover:underline">
            Sign up
          </button>
        </>
      ) : (
        <>
          Already have an account?{' '}
          <button type="button" onClick={onSwitch} className="auth-inline-link font-medium underline-offset-2 hover:underline">
            Log in
          </button>
        </>
      )}
    </p>
  );
}
