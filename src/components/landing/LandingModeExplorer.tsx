'use client';

import { useState } from 'react';

const MODES = ['Developer', 'Beginner', 'Step-by-step'] as const;

const BLURBS: Record<(typeof MODES)[number], string> = {
  Developer: 'Structured output for technical work: APIs, schemas, edge cases.',
  Beginner: 'Plain language with teaching context built into the prompt.',
  'Step-by-step': 'Ordered instructions the model can follow in sequence.',
};

const SAMPLE: Record<(typeof MODES)[number], { rough: string; tuned: string }> = {
  Developer: {
    rough: 'make an api thing for users',
    tuned: 'Design a REST API for user profiles: auth, validation, error shapes, and OpenAPI notes.',
  },
  Beginner: {
    rough: 'explain stocks for new people with charts',
    tuned: 'Build a beginner stock dashboard with tooltips that explain each metric in plain language.',
  },
  'Step-by-step': {
    rough: 'help me learn python loops',
    tuned: 'Teach Python for-loops in 5 steps with a tiny exercise after each step and one recap quiz.',
  },
};

export function LandingModeExplorer() {
  const [active, setActive] = useState<(typeof MODES)[number]>('Beginner');

  return (
    <div className="landing-panel landing-panel-elevated overflow-hidden">
      <div className="border-b border-zinc-800/80 px-5 py-4 md:px-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-400/90">Pick a mode</p>
        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Tuning modes">
          {MODES.map((mode) => {
            const isActive = mode === active;
            return (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(mode)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-sky-500/18 text-sky-100 ring-1 ring-sky-500/45 shadow-sm shadow-sky-950/25'
                    : 'bg-zinc-900/80 text-zinc-400 ring-1 ring-zinc-800 hover:text-zinc-200 hover:ring-zinc-700'
                }`}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-6 p-5 md:grid-cols-2 md:p-7">
        <div>
          <p className="text-sm font-semibold text-zinc-100">{active}</p>
          <p className="landing-prose mt-2">{BLURBS[active]}</p>
        </div>
        <div className="space-y-3 rounded-xl bg-zinc-950/50 p-4 ring-1 ring-zinc-800/80">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Rough</p>
            <p className="mt-1 text-sm italic text-zinc-500">&ldquo;{SAMPLE[active].rough}&rdquo;</p>
          </div>
          <div className="h-px bg-zinc-800/80" aria-hidden />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400/90">Tuned direction</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-200">&ldquo;{SAMPLE[active].tuned}&rdquo;</p>
          </div>
        </div>
      </div>
    </div>
  );
}
