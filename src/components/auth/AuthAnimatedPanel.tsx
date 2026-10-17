'use client';

import type { ReactNode } from 'react';

interface AuthAnimatedPanelProps {
  panelKey: string;
  children: ReactNode;
  className?: string;
  /** Subtle horizontal entrance when toggling login ↔ signup. */
  motion?: 'login' | 'signup' | 'neutral';
}

/** Crossfade + slide when switching login / signup / forgot. */
export function AuthAnimatedPanel({
  panelKey,
  children,
  className = '',
  motion = 'neutral',
}: AuthAnimatedPanelProps) {
  const motionClass =
    motion === 'signup' ? 'auth-panel-animate-signup' : motion === 'login' ? 'auth-panel-animate-login' : '';

  return (
    <div key={panelKey} className={`auth-panel-animate ${motionClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
