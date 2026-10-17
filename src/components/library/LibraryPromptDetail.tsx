'use client';

import { Copy, Sparkles, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { OutputCard } from '@/components/OutputCard';
import type { SavedPrompt } from '@/app/library/library-utils';
import {
  modeCardPillClass,
  modeLabel,
  openSavedInWorkspace,
  promptCardTitle,
  promptTokens,
  promptUpdatedLabel,
  stashReoptimize,
} from '@/app/library/library-utils';

interface LibraryPromptDetailProps {
  prompt: SavedPrompt;
  collectionName: string;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function LibraryPromptDetail({ prompt, collectionName, onClose, onDelete }: LibraryPromptDetailProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const title = promptCardTitle(prompt, collectionName);

  const copyOptimized = async () => {
    await navigator.clipboard.writeText(prompt.optimized_prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 900);
  };

  return (
    <div className="library-detail-backdrop" role="presentation" onClick={onClose}>
      <div
        className="library-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="library-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="library-detail-header">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${modeCardPillClass(prompt.mode)}`}>
                {modeLabel(prompt.mode)}
              </span>
              <span className="text-xs text-zinc-500">{collectionName}</span>
            </div>
            <h2 id="library-detail-title" className="font-heading text-xl font-semibold text-zinc-50">
              {title}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {promptUpdatedLabel(prompt.created_at)} · {promptTokens(prompt)} tokens
            </p>
          </div>
          <button type="button" onClick={onClose} className="library-detail-close" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="library-detail-body">
          <OutputCard title="Optimized prompt" text={prompt.optimized_prompt} variant="code" embedded />
          {prompt.explanation?.trim() ? (
            <div className="mt-4">
              <OutputCard title="Explanation" text={prompt.explanation} variant="prose" embedded />
            </div>
          ) : null}
          <details className="library-original-fold mt-4">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Original prompt
            </summary>
            <p className="mt-2 whitespace-pre-wrap rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm leading-7 text-zinc-400">
              {prompt.original_prompt}
            </p>
          </details>
        </div>

        <div className="library-detail-footer">
          <button
            type="button"
            className="library-reoptimize-btn"
            onClick={() => {
              stashReoptimize(prompt);
              router.push('/');
            }}
          >
            <Sparkles size={14} />
            Re-optimize
          </button>
          <button
            type="button"
            className="library-icon-btn"
            onClick={() => void copyOptimized()}
            title="Copy optimized prompt"
          >
            <Copy size={16} />
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            className="library-icon-btn text-zinc-400 hover:text-sky-300"
            onClick={() => {
              openSavedInWorkspace(prompt);
              router.push('/');
            }}
          >
            Open in workspace
          </button>
          <button
            type="button"
            className="library-icon-btn text-zinc-500 hover:text-rose-400"
            onClick={() => {
              onDelete(prompt.id);
              onClose();
            }}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
