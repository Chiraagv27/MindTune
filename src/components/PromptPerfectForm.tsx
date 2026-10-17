'use client';

import { SegmentedControl } from '@/components/SegmentedControl';
import { Select } from '@/components/Select';
import type { Mode, OptimizeVersion, ProviderId } from '@/lib/types';

const MODE_OPTIONS: Array<{ value: Mode; label: string }> = [
  { value: 'developer', label: 'Developer' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'step-by-step', label: 'Step-by-step' },
];

const PROVIDER_OPTIONS: Array<{ value: ProviderId; label: string }> = [
  { value: 'google', label: 'Gemini 2.5 Flash (Default)' },
  { value: 'openai', label: 'ChatGPT' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'groq', label: 'Llama' },
];

interface PromptPerfectFormProps {
  mode: Mode;
  onModeChange: (value: Mode) => void;
  version: OptimizeVersion;
  onVersionChange: (value: OptimizeVersion) => void;
  provider: ProviderId;
  onProviderChange: (value: ProviderId) => void;
  disabled?: boolean;
  showProvider?: boolean;
  hideModeLabel?: boolean;
  modeGroupClassName?: string;
}

export function PromptPerfectForm(props: PromptPerfectFormProps) {
  const showProvider = props.showProvider !== false;

  return (
    <div className="grid grid-cols-1 gap-5">
      <SegmentedControl
        label={props.hideModeLabel ? '' : 'Mode'}
        value={props.mode}
        onChange={props.onModeChange}
        options={MODE_OPTIONS}
        disabled={props.disabled}
        groupClassName={props.modeGroupClassName}
      />

      {showProvider ? (
        <>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">AI provider</span>
            <Select
              value={props.provider}
              onChange={props.onProviderChange}
              options={PROVIDER_OPTIONS}
              disabled={props.disabled}
            />
          </label>
          <p className="text-xs text-zinc-500">
            API keys for each provider live in{' '}
            <a href="/settings" className="font-semibold text-sky-400 hover:text-sky-300">
              Settings → Profile
            </a>
            . Verify your key there before tuning.
          </p>
        </>
      ) : null}
    </div>
  );
}
