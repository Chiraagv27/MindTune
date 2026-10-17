'use client';

import { Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { btnSecondary } from '@/lib/ui/classes';

interface PromptPerfectActionsProps {
  canSubmit: boolean;
  isLoading: boolean;
  onSubmit: () => void;
  onReset: () => void;
  usedProvider?: string;
  usedModel?: string;
}

export function PromptPerfectActions(props: PromptPerfectActionsProps) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
      <button
        type="button"
        onClick={props.onSubmit}
        disabled={!props.canSubmit || props.isLoading}
        className="optimizer-tune-btn"
      >
        {props.isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Tuning…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-sky-600" aria-hidden />
            Tune it
          </>
        )}
      </button>
      <button
        type="button"
        onClick={props.onReset}
        disabled={props.isLoading}
        className={`${btnSecondary} optimizer-composer-action-btn min-h-10 rounded-xl px-4`}
      >
        <RotateCcw className="h-4 w-4" />
        Reset
      </button>
      {props.usedModel ? (
        <div className="text-xs text-zinc-500 dark:text-zinc-400 sm:ml-auto">
          <span className="font-medium text-zinc-600 dark:text-zinc-300">{props.usedProvider}</span>
          <span className="mx-1">·</span>
          <span>{props.usedModel}</span>
        </div>
      ) : null}
    </div>
  );
}
