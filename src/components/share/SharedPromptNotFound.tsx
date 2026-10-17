import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { MindTuneShell } from '@/components/MindTuneShell';
import { SiteFooter } from '@/components/SiteFooter';

export function SharedPromptNotFound() {
  return (
    <MindTuneShell className="share-page">
      <header className="border-b border-zinc-800/90">
        <div className="landing-content-full flex h-14 items-center justify-between gap-4">
          <Link href="/welcome" className="text-lg font-semibold tracking-tight text-zinc-50 hover:text-zinc-300">
            MindTune
          </Link>
        </div>
      </header>

      <main className="landing-content flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="landing-panel landing-panel-elevated max-w-md p-8 text-center md:p-10">
          <p className="text-lg font-semibold text-zinc-50">Shared prompt not found</p>
          <p className="landing-prose mt-3 text-sm">
            This link may have expired, been removed, or never existed.
          </p>
          <Link href="/welcome" className="landing-btn-primary mt-8 inline-flex">
            Go to MindTune
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <SiteFooter
        containerClassName="landing-content-full max-w-none"
        className="border-zinc-800/80 bg-transparent text-zinc-500 [&_a:hover]:text-zinc-200"
      />
    </MindTuneShell>
  );
}
