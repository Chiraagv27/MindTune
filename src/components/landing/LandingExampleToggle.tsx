'use client';

import { useState } from 'react';

interface LandingExampleToggleProps {
  before: string;
  after: string;
  why: string;
}

export function LandingExampleToggle({ before, after, why }: LandingExampleToggleProps) {
  const [view, setView] = useState<'before' | 'after'>('before');

  return (
    <article className="landing-example-frame landing-panel landing-panel-elevated overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 px-6 py-4 md:px-8">
        <h2 className="text-xl font-semibold text-zinc-50">Live example</h2>
        <div className="flex rounded-lg bg-zinc-900/90 p-1 ring-1 ring-zinc-800" role="tablist" aria-label="Before and after">
          {(['before', 'after'] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={view === key}
              onClick={() => setView(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${
                view === key
                  ? key === 'after'
                    ? 'bg-sky-500/20 text-sky-100 ring-1 ring-sky-500/35'
                    : 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6 md:p-8">
        <p
          className={`landing-prose rounded-lg px-4 py-4 transition-opacity duration-300 ${
            view === 'before'
              ? 'bg-zinc-900/80 italic text-zinc-400'
              : 'bg-sky-500/5 text-zinc-100 ring-1 ring-sky-500/20'
          }`}
        >
          &ldquo;{view === 'before' ? before : after}&rdquo;
        </p>
        <p className="landing-prose-sm mt-6 border-t border-zinc-800/80 pt-5">{why}</p>
      </div>
    </article>
  );
}
