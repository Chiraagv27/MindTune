'use client';

export type AuthCopySlide = 'left' | 'right' | null;

interface AuthCopyTransitionProps {
  copyKey: string;
  slide: AuthCopySlide;
  title: string;
  subtitle: string;
  compact?: boolean;
}

export function AuthCopyTransition({ copyKey, slide, title, subtitle, compact }: AuthCopyTransitionProps) {
  const slideClass =
    slide === 'right'
      ? 'auth-copy-animate-right'
      : slide === 'left'
        ? 'auth-copy-animate-left'
        : 'auth-copy-animate-neutral';

  return (
    <div key={copyKey} className={`auth-copy-animate auth-copy-block ${slideClass}`}>
      <h1 className="auth-copy-title text-zinc-50">{title}</h1>
      {compact ? null : <p className="auth-copy-subtitle text-zinc-400">{subtitle}</p>}
    </div>
  );
}
