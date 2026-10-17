'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { OutputCard } from '@/components/OutputCard';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { MindTuneShell } from '@/components/MindTuneShell';
import { SiteFooter } from '@/components/SiteFooter';
import { modeDisplayLabel, modePillClass } from '@/lib/modeStyles';

export interface SharedPromptData {
  original_prompt: string;
  optimized_prompt: string;
  explanation: string | null;
  changes: string | null;
  mode: string | null;
  createdAtLabel: string | null;
}

interface SharedPromptViewProps {
  data: SharedPromptData;
  sharePath?: string;
}

export function SharedPromptView({ data, sharePath = '/welcome' }: SharedPromptViewProps) {
  const modeLabel = modeDisplayLabel(data.mode ?? 'developer');
  const modeClass = modePillClass(data.mode ?? 'developer');

  return (
    <MindTuneShell className="share-page">
      <header className="border-b border-zinc-800/90">
        <div className="landing-content-full flex h-14 items-center justify-between gap-4">
          <Link href="/welcome" className="text-lg font-semibold tracking-tight text-zinc-50 hover:text-zinc-300">
            MindTune
          </Link>
          <Link href="/welcome" className="landing-btn-primary !py-2.5 !px-4 text-sm">
            Try MindTune
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="landing-content-wide relative z-10 py-8 md:py-10">
        <div className="optimizer-page-glow pointer-events-none" aria-hidden />

        <Breadcrumbs
          items={[
            { name: 'Home', href: '/welcome' },
            { name: 'Shared prompt', href: sharePath },
          ]}
        />

        <header className="relative mb-7 border-b border-zinc-800/80 pb-5">
          <p className="optimizer-eyebrow">Shared tune</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">
            Optimized prompt
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
            Someone shared a MindTune result with you. Copy the prompt below or sign up to tune your own.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${modeClass}`}>
              {modeLabel}
            </span>
            {data.createdAtLabel ? (
              <span className="text-xs text-zinc-500">{data.createdAtLabel}</span>
            ) : null}
          </div>
        </header>

        <div className="optimizer-results optimizer-results-stack relative">
          {data.original_prompt?.trim() ? (
            <OutputCard
              title="Original prompt"
              text={data.original_prompt}
              variant="prose"
              panel="landing"
              collapsible
              defaultExpanded
            />
          ) : null}

          {data.optimized_prompt?.trim() ? (
            <OutputCard
              title="Optimized prompt"
              text={data.optimized_prompt}
              variant="code"
              panel="landing"
              emphasis="primary"
              collapsible
              defaultExpanded
            />
          ) : null}

          {data.explanation?.trim() ? (
            <OutputCard
              title="Explanation"
              text={data.explanation}
              variant="prose"
              panel="landing"
              emphasis="primary"
              collapsible
              defaultExpanded
              proseScroll
            />
          ) : null}

          {data.changes?.trim() ? (
            <OutputCard
              title="What changed and why"
              text={data.changes}
              variant="prose"
              panel="landing"
              emphasis="primary"
              collapsible
              defaultExpanded
              proseScroll
            />
          ) : null}
        </div>

        <section className="landing-cta-panel relative mt-10 px-8 py-12 text-center md:px-12 md:py-14">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.1),transparent_58%)]"
            aria-hidden
          />
          <p className="relative text-xs font-semibold uppercase tracking-[0.28em] text-sky-400/90">
            Your turn
          </p>
          <h2 className="relative mt-3 text-xl font-semibold text-zinc-50 md:text-2xl">
            Tune prompts like this in seconds
          </h2>
          <p className="relative mx-auto mt-3 max-w-md landing-prose text-sm">
            Free to start. Developer, Beginner, and Step-by-step modes—with explanations and share links built in.
          </p>
          <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/welcome" className="landing-btn-primary">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/?auth=login" className="landing-btn-secondary">
              Log in
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter
        containerClassName="landing-content-full max-w-none"
        className="border-zinc-800/80 bg-transparent text-zinc-500 [&_a:hover]:text-zinc-200"
      />
    </MindTuneShell>
  );
}
