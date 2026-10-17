'use client';

import { Check, Loader2, Share2 } from 'lucide-react';
import { useState } from 'react';

type ShareState = 'idle' | 'loading' | 'copied' | 'error';

interface RecentDrawerShareButtonProps {
  sessionId: string;
}

export function RecentDrawerShareButton({ sessionId }: RecentDrawerShareButtonProps) {
  const [shareState, setShareState] = useState<ShareState>('idle');

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!sessionId.trim() || shareState === 'loading') return;

    setShareState('loading');
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = (await res.json()) as { share_id?: string; error?: string };
      if (!res.ok || !data.share_id) throw new Error(data.error ?? 'Failed');
      const url = `${window.location.origin}/s/${data.share_id}`;
      await navigator.clipboard.writeText(url);
      setShareState('copied');
      window.setTimeout(() => setShareState('idle'), 2500);
    } catch {
      setShareState('error');
      window.setTimeout(() => setShareState('idle'), 2500);
    }
  };

  const title =
    shareState === 'copied'
      ? 'Link copied'
      : shareState === 'error'
        ? 'Share failed — try again'
        : shareState === 'loading'
          ? 'Generating link…'
          : 'Share prompt';

  return (
    <button
      type="button"
      onClick={(e) => void handleShare(e)}
      disabled={shareState === 'loading'}
      className="recent-drawer-icon-btn"
      title={title}
      aria-label={title}
    >
      {shareState === 'loading' ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : shareState === 'copied' ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <Share2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
