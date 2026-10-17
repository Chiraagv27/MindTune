import type { ReactNode } from 'react';

interface LandingSectionProps {
  id: string;
  children: ReactNode;
  alt?: boolean;
  className?: string;
}

export function LandingSection({ id, children, alt = false, className = '' }: LandingSectionProps) {
  return (
    <section
      id={id}
      className={`landing-section ${alt ? 'landing-section-alt landing-full-bleed' : ''} ${className}`}
    >
      <div className="landing-content-full">{children}</div>
    </section>
  );
}
