import Link from 'next/link';

import { MindTuneShell } from '@/components/MindTuneShell';
import { SiteFooter } from '@/components/SiteFooter';

export default function NotFound() {
  return (
    <MindTuneShell>
      <main className="landing-content-wide flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
        <p className="optimizer-eyebrow">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">Page not found</h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-500">
          That link may be expired or mistyped. Head back to the optimizer or explore MindTune from the welcome page.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="landing-btn-primary">
            Open optimizer
          </Link>
          <Link href="/welcome" className="landing-btn-secondary">
            Welcome page
          </Link>
        </div>
      </main>
      <SiteFooter className="border-zinc-800 bg-transparent text-zinc-500 [&_a:hover]:text-zinc-200" />
    </MindTuneShell>
  );
}
