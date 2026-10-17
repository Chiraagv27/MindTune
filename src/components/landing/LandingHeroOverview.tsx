'use client';

import { ArrowRight } from 'lucide-react';
import { LandingProductShowcase } from '@/components/landing/LandingProductShowcase';
import { landingSectionNavClick } from '@/lib/landingScroll';

interface LandingHeroOverviewProps {
  before: string;
  after: string;
  explanation: string;
  onLogin: () => void;
  onSignUp: () => void;
}

const HERO_STEPS = [
  {
    title: 'Speak or type',
    body: 'Rough sentences are enough. Use the microphone when typing gets in the way.',
  },
  { title: 'Three ways to tune', body: 'Developer, Beginner, or Step-by-step.' },
  {
    title: 'Keep what works',
    body: 'Explanation, follow-up questions, a share link, and a library.',
  },
] as const;

export function LandingHeroOverview({ before, after, explanation, onLogin, onSignUp }: LandingHeroOverviewProps) {
  return (
    <section
      id="hero"
      className="landing-hero landing-hero-premium relative isolate overflow-hidden pt-24 md:pt-28"
    >
      <div className="landing-hero-beams pointer-events-none absolute inset-0" aria-hidden />
      <div className="landing-hero-vignette pointer-events-none absolute inset-0" aria-hidden />

      <div className="landing-content-full relative">
        <div className="landing-hero-eyebrow mb-6 flex items-center gap-4 md:mb-8">
          <span className="h-px min-w-0 flex-1 bg-gradient-to-r from-transparent via-sky-400/35 to-sky-400/55" aria-hidden />
          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-400/85">Overview</span>
          <span className="h-px min-w-0 flex-1 bg-gradient-to-l from-transparent via-sky-400/35 to-sky-400/55" aria-hidden />
        </div>

        <div className="landing-hero-grid">
          <div className="landing-hero-copy">
            <h1 className="text-[clamp(2.35rem,5.5vw,4.25rem)] font-medium leading-[1.04] tracking-[-0.045em] text-zinc-50 xl:text-[4.5rem]">
              Speak messy.
              <span className="landing-hero-title-accent mt-1 block md:mt-2">Get precision.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-zinc-300 md:text-lg md:leading-8 lg:mx-0">
              MindTune turns a rough idea, typed or spoken, into a prompt you can reuse. You see what changed, and why.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <button type="button" onClick={onSignUp} className="landing-btn-primary">
                Get started
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
              <button type="button" onClick={onLogin} className="landing-btn-secondary">
                I already have an account
              </button>
              <a
                href="#how-it-works"
                onClick={(e) => landingSectionNavClick(e, 'how-it-works')}
                className="landing-btn-ghost hidden sm:inline-flex"
              >
                How it works
              </a>
            </div>

            <div className="landing-hero-steps mx-auto mt-10 lg:mx-0 lg:max-w-none">
              {HERO_STEPS.map((step) => (
                <div key={step.title} className="landing-hero-step">
                  <p className="text-sm font-semibold text-zinc-100">{step.title}</p>
                  <p className="landing-prose-sm mt-1">{step.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="landing-hero-showcase-wrap">
            <LandingProductShowcase before={before} after={after} explanation={explanation} />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" aria-hidden />
    </section>
  );
}
