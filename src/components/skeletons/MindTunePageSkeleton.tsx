import { MindTuneShell } from '@/components/MindTuneShell';

export function MindTunePageSkeleton({ title = 'Loading' }: { title?: string }) {
  return (
    <MindTuneShell>
      <div className="landing-content-wide animate-pulse py-8 md:py-10">
        <div className="mb-6 h-9 w-48 rounded-lg bg-zinc-800/80" aria-hidden />
        <p className="sr-only">{title}</p>
        <div className="space-y-4">
          <div className="h-24 rounded-2xl bg-zinc-900/80" />
          <div className="h-24 rounded-2xl bg-zinc-900/80" />
          <div className="h-40 rounded-2xl bg-zinc-900/80" />
        </div>
      </div>
    </MindTuneShell>
  );
}
