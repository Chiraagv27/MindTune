                                                                                        'use client';

import { useEffect } from 'react';
import {
  ArrowRight,
  Bookmark,
  FolderOpen,
  History,
  MessageCircle,
  Mic,
  Share2,
  SlidersHorizontal,
} from 'lucide-react';
import { LandingExampleToggle } from '@/components/landing/LandingExampleToggle';
import { LandingHeroOverview } from '@/components/landing/LandingHeroOverview';
import { LandingModeExplorer } from '@/components/landing/LandingModeExplorer';
import { LandingNavbar, LANDING_NAV } from '@/components/landing/LandingNavbar';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { LandingSection } from '@/components/landing/LandingSection';
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader';
import { MindTuneShell } from '@/components/MindTuneShell';
import { SiteFooter } from '@/components/SiteFooter';
import { useLandingScrollSpy } from '@/hooks/useLandingScrollSpy';
import { scrollToLandingSection } from '@/lib/landingScroll';

interface LandingPageProps {
  onLogin: () => void;
  onSignUp: () => void;
}

const EXAMPLE = {
  before:
    'I need like a thing that tells me stock prices but like in a fun way for beginners, maybe with some graphs or whatever',
  after:
    'Create a beginner-friendly stock price dashboard with real-time data and colour-coded charts. Explain each metric in a tooltip, include a watchlist, and add a What does this mean sidebar for first-time investors.',
  why: 'Names the audience, the interface, and the teaching job.',
};

const NOTES = [
  { title: 'Speak or type', body: 'Rough sentences are enough. Use the microphone when typing gets in the way.' },
  { title: 'Three ways to tune', body: 'Developer, Beginner, or Step-by-step.' },
  { title: 'Keep what works', body: 'Explanation, follow-up questions, a share link, and a library.' },
];

const MODES = ['Developer', 'Beginner', 'Step-by-step'] as const;

const KEEP_ITEMS = [
  { label: 'Explanation', icon: MessageCircle },
  { label: 'Follow-up Questions', icon: MessageCircle },
  { label: 'Share', icon: Share2 },
  { label: 'Library', icon: Bookmark },
] as const;

const SECTION_IDS = LANDING_NAV.map((item) => item.id);

export function LandingPage({ onLogin, onSignUp }: LandingPageProps) {
  const { activeId } = useLandingScrollSpy(SECTION_IDS);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash || !SECTION_IDS.includes(hash as (typeof SECTION_IDS)[number])) return;
    const id = window.requestAnimationFrame(() => scrollToLandingSection(hash));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <MindTuneShell className="landing-page">
      <div className="landing-ambient-wash pointer-events-none fixed inset-0 z-0" aria-hidden />

      <LandingNavbar onLogin={onLogin} onSignUp={onSignUp} activeId={activeId} />
      <main className="relative z-10 pb-20">
        <LandingHeroOverview
          before={EXAMPLE.before}
          after={EXAMPLE.after}
          explanation={EXAMPLE.why}
          onLogin={onLogin}
          onSignUp={onSignUp}
        />

        <div className="landing-section-band landing-full-bleed">
          <div className="landing-marquee-track" aria-hidden>
            {[...MODES, ...MODES, ...MODES, ...MODES].map((mode, i) => (
              <span key={`${mode}-${i}`} className="landing-marquee-item">
                {mode}
              </span>
            ))}
          </div>
        </div>

        <LandingSection id="how-it-works">
            <LandingReveal>
              <LandingSectionHeader
                eyebrow="How it works"
                title="Speak messy. Tune with intent."
                description="Three steps: capture your idea, pick how MindTune should shape it, then keep what works."
                index="01"
              />
            </LandingReveal>
            <div className="grid gap-5 md:grid-cols-3 md:gap-6">
              {NOTES.map((note, index) => (
                <LandingReveal key={note.title} delayMs={index * 80}>
                  <article
                    className={`landing-panel h-full p-6 md:p-7 ${index === 0 ? 'landing-panel-elevated' : ''}`}
                  >
                    <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-50">
                      {note.title === 'Speak or type' ? <Mic className="h-4 w-4 text-sky-400" aria-hidden /> : null}
                      {note.title === 'Three ways to tune' ? (
                        <SlidersHorizontal className="h-4 w-4 text-sky-400" aria-hidden />
                      ) : null}
                      {note.title === 'Keep what works' ? <Bookmark className="h-4 w-4 text-sky-400" aria-hidden /> : null}
                      {note.title}
                    </h2>
                    <p className="landing-prose mt-3">{note.body}</p>
                  </article>
                </LandingReveal>
              ))}
            </div>
            <LandingReveal delayMs={120} className="mt-8">
              <LandingModeExplorer />
            </LandingReveal>
          </LandingSection>

          <LandingSection id="workspace" alt>
            <LandingReveal>
              <LandingSectionHeader
                eyebrow="Workspace"
                title="The optimizer flow"
                description="Compose at the top, then stacked results, Q&A, and share or save."
                index="02"
              />
            </LandingReveal>
            <div className="landing-workspace-cards grid w-full gap-6 lg:grid-cols-2 lg:items-stretch">
              <LandingReveal delayMs={0} className="min-w-0">
                <div className="landing-panel landing-panel-elevated flex h-full min-h-full flex-col overflow-hidden">
                  <p className="border-b border-zinc-800/80 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-500 md:px-6">
                    Optimizer flow
                  </p>
                  <div className="grid flex-1 gap-6 p-5 md:grid-cols-2 md:p-6">
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-zinc-100">1 · Compose</p>
                      <p className="landing-prose mt-3 flex-1 rounded-lg bg-zinc-900/80 px-4 py-3 italic text-zinc-400">
                        Speak or type. Mic in the corner.
                      </p>
                      <p className="landing-prose-sm mt-3">Mode pills and Tune it on the same card.</p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-zinc-100">2 · Review</p>
                      <p className="landing-prose mt-3 flex-1">Optimized prompt and explanation side by side.</p>
                      <p className="landing-prose-sm mt-3">What changed and why, then ask follow-up questions.</p>
                    </div>
                  </div>
                  <div className="border-t border-zinc-800/80 px-5 py-4 md:px-6 md:py-5">
                    <p className="text-sm font-semibold text-zinc-100">3 · Refine</p>
                    <p className="landing-prose-sm mt-2">
                      Switch modes, tune again, or pick up a past run from Recent in the app bar.
                    </p>
                  </div>
                </div>
              </LandingReveal>
              <LandingReveal delayMs={80} className="min-w-0">
                <div className="landing-panel landing-panel-elevated flex h-full min-h-full flex-col px-5 py-2 md:px-6">
                  <p className="border-b border-zinc-800/80 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    After each tune
                  </p>
                  <div className="landing-workspace-after-list flex flex-1 flex-col justify-center">
                    {KEEP_ITEMS.map(({ label, icon: Icon }) => (
                      <div key={label} className="landing-list-row items-center">
                        <div className="rounded-lg bg-sky-500/10 p-2.5">
                          <Icon className="h-4 w-4 text-sky-400" aria-hidden />
                        </div>
                        <p className="text-base font-medium text-zinc-100">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </LandingReveal>
            </div>
          </LandingSection>

          <LandingSection id="save">
            <LandingReveal>
              <LandingSectionHeader
                eyebrow="Save & share"
                title="Library and recent runs"
                description="Collections for keepsakes, recent for picking up where you left off, share links when you are ready."
                index="03"
              />
            </LandingReveal>
            <div className="grid gap-6 lg:grid-cols-2">
              <LandingReveal>
                <div className="landing-panel landing-panel-elevated h-full p-8 md:p-10">
                  <FolderOpen className="h-5 w-5 text-sky-400" aria-hidden />
                  <h3 className="mt-3 text-2xl font-semibold text-zinc-50">Library</h3>
                  <p className="landing-prose mt-4">
                    Save tuned prompts into collections. Search, filter by mode, and reopen any preset in the optimizer.
                  </p>
                </div>
              </LandingReveal>
              <LandingReveal delayMs={60}>
                <div className="grid h-full gap-4 sm:grid-cols-1">
                  {[
                    { title: 'Recent prompts', body: 'Use the clock in the app bar to reload a past run.', icon: History },
                    { title: 'Share link', body: 'Read-only view of a tuned prompt for teammates or clients.', icon: Share2 },
                  ].map(({ title, body, icon: Icon }) => (
                    <article key={title} className="landing-panel flex gap-4 p-6">
                      <Icon className="h-5 w-5 shrink-0 text-sky-400" aria-hidden />
                      <div>
                        <h4 className="text-lg font-semibold text-zinc-50">{title}</h4>
                        <p className="landing-prose mt-2">{body}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </LandingReveal>
            </div>
          </LandingSection>

          <LandingSection id="example" alt>
            <LandingReveal>
              <LandingExampleToggle before={EXAMPLE.before} after={EXAMPLE.after} why={EXAMPLE.why} />
            </LandingReveal>
          </LandingSection>

          <LandingSection id="cta">
            <LandingReveal>
              <div className="landing-cta-panel px-8 py-16 text-center md:px-14 md:py-24">
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.12),transparent_58%)]"
                  aria-hidden
                />
                <p className="relative text-xs font-semibold uppercase tracking-[0.28em] text-sky-400/90">Ready when you are</p>
                <h2 className="relative mt-4 text-3xl font-semibold tracking-tight text-white md:text-[2.75rem] md:leading-tight">
                  Speak messy.
                  <span className="mt-2 block font-normal text-zinc-400">Get precision.</span>
                </h2>
                <p className="relative mx-auto mt-5 max-w-xl landing-prose">
                  MindTune turns a rough idea, typed or spoken, into a prompt you can reuse. You see what changed,
                  and why.
                </p>
                <div className="relative mt-10 flex flex-wrap items-center justify-center gap-3">
                  <button type="button" onClick={onSignUp} className="landing-btn-primary">
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={onLogin} className="landing-btn-secondary">
                    I already have an account
                  </button>
                </div>
              </div>
            </LandingReveal>
          </LandingSection>
      </main>

      <div className="border-t border-zinc-800/80">
        <div className="landing-content-full">
          <SiteFooter
            containerClassName="max-w-none px-0"
            className="border-0 bg-transparent py-10 text-zinc-500 [&_a:hover]:text-zinc-200"
          />
        </div>
      </div>
    </MindTuneShell>
  );
}
