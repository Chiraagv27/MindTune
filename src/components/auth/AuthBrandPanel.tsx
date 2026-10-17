'use client';

import { Bookmark, Mic, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { LandingProductShowcase } from '@/components/landing/LandingProductShowcase';

const PILLARS = [
  { icon: Mic, text: 'Speak or type rough ideas' },
  { icon: SlidersHorizontal, text: 'Three tuning modes' },
  { icon: Bookmark, text: 'Library and share links' },
] as const;

const PREVIEW = {
  before: 'help me explain APIs to new devs without jargon',
  after:
    'Explain REST APIs to junior developers using a product analogy, a short glossary, and one curl example with plain-language comments.',
  why: 'Names the audience, format, and teaching goal.',
};

interface AuthBrandPanelProps {
  onLogoClick?: () => void;
}

export function AuthBrandPanel({ onLogoClick }: AuthBrandPanelProps) {
  const logo = onLogoClick ? (
    <button type="button" onClick={onLogoClick} className="auth-brand-logo text-zinc-50">
      MindTune
    </button>
  ) : (
    <Link href="/welcome" className="auth-brand-logo text-zinc-50">
      MindTune
    </Link>
  );

  return (
    <aside className="auth-brand-panel relative hidden min-h-0 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
      <div className="landing-hero-beams pointer-events-none absolute inset-0" aria-hidden />
      <div className="landing-hero-vignette pointer-events-none absolute inset-0" aria-hidden />

      <div className="auth-brand-scroll relative flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-8 py-10 xl:px-14 xl:py-12">
        <div className="auth-brand-inner mx-auto w-full max-w-xl">
          {logo}
          <div className="auth-brand-logo-rule mt-5" aria-hidden />

          <h2 className="auth-brand-headline mt-7 font-medium tracking-[-0.04em] text-zinc-50">
            Speak messy.
            <span className="landing-hero-title-accent mt-2 block font-normal">Get precision.</span>
          </h2>
          <p className="auth-brand-lede mt-5 max-w-md text-zinc-400">
            Tune prompts with explanation, follow-up questions, and a library that stays in sync when you sign in.
          </p>

          <ul className="mt-8 flex flex-wrap gap-2">
            {PILLARS.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-950/50 px-3.5 py-2 text-sm text-zinc-300"
              >
                <Icon className="h-3.5 w-3.5 text-sky-400" aria-hidden />
                {text}
              </li>
            ))}
          </ul>

          <div className="auth-brand-showcase mt-10">
            <LandingProductShowcase
              before={PREVIEW.before}
              after={PREVIEW.after}
              explanation={PREVIEW.why}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
