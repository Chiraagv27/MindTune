'use client';

import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { memo, useState } from 'react';

import { PromptChatBox } from '@/components/PromptChatBox';
import { PromptPerfectActions } from '@/components/PromptPerfectActions';
import { PromptPerfectForm } from '@/components/PromptPerfectForm';
import { Select } from '@/components/Select';
import type { Mode, OptimizeVersion, ProviderId } from '@/lib/types';

const PROVIDER_OPTIONS = [
  { value: 'google' as ProviderId, label: 'Gemini 2.5 Flash (Default)' },
  { value: 'openai' as ProviderId, label: 'ChatGPT' },
  { value: 'anthropic' as ProviderId, label: 'Anthropic' },
  { value: 'groq' as ProviderId, label: 'Llama' },
] as const;

export type PromptLoadRequest = { text: string; key: number };

interface OptimizerComposerProps {
  isLoading: boolean;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  version: OptimizeVersion;
  onVersionChange: (version: OptimizeVersion) => void;
  provider: ProviderId;
  onProviderChange: (provider: ProviderId) => void;
  usedProvider?: ProviderId | string;
  usedModel?: string;
  promptLoad?: PromptLoadRequest | null;
  error: string | null;
  shouldShowKeyHint: boolean;
  onTune: (prompt: string) => void;
  onReset: () => void;
}

function OptimizerComposerEditor({
  isLoading,
  mode,
  onModeChange,
  version,
  onVersionChange,
  provider,
  onProviderChange,
  usedProvider,
  usedModel,
  initialPrompt,
  error,
  shouldShowKeyHint,
  onTune,
  onReset,
}: OptimizerComposerProps & { initialPrompt: string }) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div id="optimizer-composer" className="landing-panel optimizer-composer space-y-5 p-5 md:p-6">
      <PromptChatBox
        variant="embedded"
        value={prompt}
        onChange={setPrompt}
        disabled={isLoading}
        onAutoTune={() => {
          const trimmed = prompt.trim();
          if (!trimmed) return;
          onTune(trimmed);
        }}
      />

      <div className="optimizer-composer-toolbar flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="w-fit max-w-full">
          <PromptPerfectForm
            mode={mode}
            onModeChange={onModeChange}
            version={version}
            onVersionChange={onVersionChange}
            provider={provider}
            onProviderChange={onProviderChange}
            disabled={isLoading}
            showProvider={false}
            hideModeLabel
            modeGroupClassName="optimizer-composer-mode-segment"
          />
        </div>
        <div className="shrink-0 sm:ml-auto">
          <PromptPerfectActions
            canSubmit={Boolean(prompt.trim())}
            isLoading={isLoading}
            usedProvider={usedProvider}
            usedModel={usedModel}
            onSubmit={() => {
              const trimmed = prompt.trim();
              if (!trimmed) return;
              onTune(trimmed);
            }}
            onReset={() => {
              setPrompt('');
              onReset();
            }}
          />
        </div>
      </div>

      <div className="optimizer-composer-divider pt-4">
        <button
          type="button"
          onClick={() => setAdvancedOpen((o) => !o)}
          className="optimizer-advanced-toggle flex w-full cursor-pointer items-center justify-between gap-3 text-left text-sm font-medium"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="optimizer-advanced-icon h-4 w-4 text-zinc-500 transition-colors" aria-hidden />
            Advanced pipeline configuration
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>
        {advancedOpen ? (
          <div className="mt-4 grid gap-4 sm:max-w-md">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">AI provider</span>
              <Select
                value={provider}
                onChange={onProviderChange}
                options={[...PROVIDER_OPTIONS]}
                disabled={isLoading}
              />
            </label>
            <p className="text-xs text-zinc-500">
              API keys for each provider live in{' '}
              <a href="/settings" className="font-semibold text-sky-400 hover:text-sky-300">
                Settings → Profile
              </a>
              . Verify your key there before tuning.
            </p>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      {shouldShowKeyHint ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          Add and verify your {provider} API key in{' '}
          <a href="/settings" className="font-semibold text-sky-300 underline-offset-2 hover:underline">
            Settings
          </a>{' '}
          before tuning with this provider.
        </div>
      ) : null}
    </div>
  );
}

function OptimizerComposerInner(props: OptimizerComposerProps) {
  const seedKey = props.promptLoad?.key ?? 'default';
  const initialPrompt = props.promptLoad?.text ?? '';

  return (
    <OptimizerComposerEditor
      key={seedKey}
      {...props}
      initialPrompt={initialPrompt}
    />
  );
}

export const OptimizerComposer = memo(OptimizerComposerInner);
