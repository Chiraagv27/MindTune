'use client';

import { Check, Copy, Loader2, Share2 } from 'lucide-react';
import { useState } from 'react';

import { useToast } from '@/components/ui/ToastProvider';

interface ShareButtonProps {
  sessionId?: string | null;
}

type ShareState = 'idle' | 'loading' | 'copied' | 'error';

export function ShareButton({ sessionId }: ShareButtonProps) {
  const { toast } = useToast();
  const [shareState, setShareState] = useState<ShareState>('idle');
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  if (!sessionId) return null;

  const handleShare = async () => {
    setShareState('loading');
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      if (!res.ok || !data.share_id) throw new Error(data.error ?? 'Failed');
      const url = `${window.location.origin}/s/${data.share_id}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      setShareState('copied');
      toast('Share link copied to clipboard', 'success');
      setTimeout(() => setShareState('idle'), 3000);
    } catch {
      setShareState('error');
      toast('Could not create share link', 'error');
      setTimeout(() => setShareState('idle'), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleShare}
        disabled={shareState === 'loading'}
        className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white/70 px-3 py-1.5 text-base font-semibold text-zinc-900 shadow-sm backdrop-blur transition hover:bg-white disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-50 dark:hover:bg-zinc-950"
      >
        {shareState === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
        {shareState === 'copied' && <Check className="h-4 w-4 text-emerald-500" />}
        {(shareState === 'idle' || shareState === 'error') && <Share2 className="h-4 w-4" />}
        {shareState === 'loading' ? 'Generating...'
          : shareState === 'copied' ? 'Link copied!'
          : shareState === 'error' ? 'Failed. Try again.'
          : 'Share'}
      </button>

      {shareUrl && shareState === 'copied' && (
        <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white/60 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/40">
          <span className="flex-1 truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {shareUrl}
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            className="shrink-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            title="Copy again"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
