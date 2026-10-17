'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';

import { OutputCard } from '@/components/OutputCard';

const PromptQABox = dynamic(
  () => import('@/components/PromptQABox').then((mod) => mod.PromptQABox),
  { ssr: false },
);
import { SavePromptButton } from '@/components/SavePromptButton';
import { ShareButton } from '@/components/ShareButton';
import type { Mode, ProviderId } from '@/lib/types';

interface PromptPerfectOutputsProps {
  optimizedText: string;
  explanation: string;
  changes: string;
  sessionId: string;
  mode: Mode;
  isLoading: boolean;
  provider: ProviderId;
  apiKey: string;
  originalText: string;
  userId: string;
  usedProvider?: ProviderId | string;
  initialQAMessages?: { role: 'user' | 'assistant'; content: string }[];
  /** Reserved: when true, hide empty placeholder cards (unused for Recent +). */
  hideEmptyShell?: boolean;
}

function PromptPerfectOutputsInner(props: PromptPerfectOutputsProps) {
  const hasResult = Boolean(props.optimizedText.trim());
  const showSecondaryExpanded = !hasResult && !props.isLoading;

  if (!hasResult && !props.isLoading && props.hideEmptyShell) {
    return null;
  }

  return (
    <div className="optimizer-results optimizer-results-stack">
      <OutputCard
        key={`optimized-${props.sessionId}`}
        title="Optimized prompt"
        text={props.optimizedText}
        isLoading={props.isLoading}
        emptyText="Your optimized prompt will show up here."
        variant="code"
        panel="landing"
        emphasis="primary"
        collapsible
        defaultExpanded
      />

      <OutputCard
        key={`explanation-${props.sessionId}`}
        title="Explanation"
        text={props.explanation}
        isLoading={props.isLoading}
        emptyText="A detailed breakdown of what the optimized prompt does and why it works will show up here."
        variant="prose"
        panel="landing"
        emphasis="primary"
        collapsible
        defaultExpanded={showSecondaryExpanded}
      />

      <OutputCard
        key={`changes-${props.sessionId}`}
        title="What changed and why"
        text={props.changes}
        isLoading={props.isLoading}
        emptyText="Bullet-by-bullet edits compared to your original prompt will show up here."
        variant="prose"
        panel="landing"
        emphasis="primary"
        collapsible
        defaultExpanded={showSecondaryExpanded}
      />

      {hasResult && !props.isLoading ? (
        <>
          <PromptQABox
            key={props.sessionId}
            optimizedPrompt={props.optimizedText}
            explanation={props.explanation}
            provider={props.provider}
            apiKey={props.apiKey}
            initialMessages={props.initialQAMessages}
            sessionId={props.sessionId}
          />
          <div className="optimizer-results-actions flex flex-wrap items-center gap-2">
            <ShareButton sessionId={props.sessionId} />
            <SavePromptButton
              originalPrompt={props.originalText}
              optimizedPrompt={props.optimizedText}
              explanation={props.explanation}
              mode={props.mode}
              provider={(props.usedProvider ?? props.provider) as ProviderId}
              userId={props.userId}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

export const PromptPerfectOutputs = memo(PromptPerfectOutputsInner);
