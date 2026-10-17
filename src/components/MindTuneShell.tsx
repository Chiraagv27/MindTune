import type { ReactNode } from 'react';

interface MindTuneShellProps {
  children: ReactNode;
  className?: string;
}

/** Shared zinc/sky backdrop used on landing, auth, and signed-in app routes. */
export function MindTuneShell({ children, className = '' }: MindTuneShellProps) {
  return (
    <div className={`mindtune-shell relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100 ${className}`}>
      <div className="landing-grid-bg pointer-events-none fixed inset-0" aria-hidden />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
