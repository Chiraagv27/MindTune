'use client';

import { Mic } from 'lucide-react';

const MODES = ['Developer', 'Beginner', 'Step-by-step'] as const;
const ACTIVE_MODE = 'Beginner';

interface LandingProductShowcaseProps {
  before: string;
  after: string;
  explanation: string;
}

export function LandingProductShowcase({ before, after, explanation }: LandingProductShowcaseProps) {
  return (
    <div className="landing-showcase relative w-full">
      <div
        className="landing-showcase-frame landing-panel landing-panel-elevated overflow-hidden"
        role="img"
        aria-label="Preview of the MindTune prompt optimizer workspace"
      >
        <div className="flex items-center justify-between gap-3 border-b border-zinc-800/80 bg-zinc-900/40 px-5 py-3 md:px-6">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500/70 ring-1 ring-sky-400/30" aria-hidden />
            <span className="ml-1 text-sm font-semibold text-zinc-100">MindTune</span>
          </div>
          <span className="text-xs font-medium text-zinc-500">Preview</span>
        </div>

        <div className="flex flex-wrap gap-1 border-b border-zinc-800/80 px-5 py-2.5 text-sm md:px-6">
          <span className="rounded-md bg-zinc-800/90 px-2.5 py-1 font-medium text-zinc-100">Optimizer</span>
          <span className="px-2.5 py-1 text-zinc-500">Library</span>
          <span className="px-2.5 py-1 text-zinc-500">Settings</span>
        </div>

        <div className="divide-y divide-zinc-800/80">
          <div className="p-5 md:p-6">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-zinc-100">Your prompt</h3>
              <Mic className="h-4 w-4 text-sky-400" aria-hidden />
            </div>
            <p className="rounded-lg bg-zinc-900/90 px-4 py-4 text-[15px] leading-7 text-zinc-300">{before}</p>
            <p className="mt-3 text-sm text-zinc-500">Type or use the mic. Rough phrasing is fine.</p>
          </div>

          <div className="grid gap-6 p-5 md:grid-cols-2 md:p-6">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Mode</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {MODES.map((mode) => {
                  const active = mode === ACTIVE_MODE;
                  return (
                    <span
                      key={mode}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                        active
                          ? 'bg-sky-500/15 text-sky-100 ring-1 ring-sky-500/40'
                          : 'bg-zinc-900/80 text-zinc-500 ring-1 ring-zinc-800'
                      }`}
                    >
                      {mode}
                    </span>
                  );
                })}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                {ACTIVE_MODE} adds plain language and teaching context.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-100">AI provider</h3>
              <p className="mt-3 rounded-lg bg-zinc-900/90 px-3 py-2.5 text-sm text-zinc-300">Gemini 2.5 Flash (Default)</p>
              <p className="mt-4 text-sm font-medium text-emerald-400/90">Optimization complete</p>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <h3 className="text-sm font-semibold text-zinc-100">Results</h3>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">Optimized prompt</p>
                <p className="mt-2 text-[15px] leading-7 text-zinc-100">{after}</p>
              </div>
              <div className="md:border-l md:border-zinc-800/80 md:pl-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Explanation</p>
                <p className="mt-2 text-[15px] leading-7 text-zinc-400">{explanation}</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-zinc-500">
              In the app you also get what changed, follow-up Q&A, sharing, and a library for saved collections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
