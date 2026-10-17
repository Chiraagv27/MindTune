'use client';

import { ChevronDown, KeyRound, Lock } from 'lucide-react';
import { useState } from 'react';

import { ApiKeyField } from '@/components/ApiKeyField';
import { Select } from '@/components/Select';
import { useApiConfig } from '@/hooks/useApiConfig';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import type { ProviderId } from '@/lib/types';

const PROVIDERS: Array<{
  id: ProviderId;
  label: string;
  placeholder: string;
  keyLabel: string;
}> = [
  {
    id: 'google',
    label: 'Google Gemini',
    placeholder: 'AIzaSy...',
    keyLabel: 'Gemini API key',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    placeholder: 'sk-...',
    keyLabel: 'OpenAI API key',
  },
  {
    id: 'anthropic',
    label: 'Anthropic Claude',
    placeholder: 'sk-ant-...',
    keyLabel: 'Anthropic API key',
  },
  {
    id: 'groq',
    label: 'Groq',
    placeholder: 'gsk_...',
    keyLabel: 'Groq API key',
  },
];

interface SettingsApiKeysPanelProps {
  userId: string;
}

export function SettingsApiKeysPanel({ userId }: SettingsApiKeysPanelProps) {
  const { hasServerKey } = useApiConfig();
  const [open, setOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<ProviderId>('google');

  const googleKey = useLocalStorageState(`promptperfect:apiKey:google:${userId}`, '');
  const openaiKey = useLocalStorageState(`promptperfect:apiKey:openai:${userId}`, '');
  const anthropicKey = useLocalStorageState(`promptperfect:apiKey:anthropic:${userId}`, '');
  const groqKey = useLocalStorageState(`promptperfect:apiKey:groq:${userId}`, '');

  const keys: Record<ProviderId, ReturnType<typeof useLocalStorageState<string>>> = {
    google: googleKey,
    openai: openaiKey,
    anthropic: anthropicKey,
    groq: groqKey,
  };

  const configuredCount = PROVIDERS.filter(
    (p) => keys[p.id].hydrated && keys[p.id].value.trim().length > 0,
  ).length;

  const provider = PROVIDERS.find((p) => p.id === activeProvider) ?? PROVIDERS[0];
  const slot = keys[provider.id];
  const serverHasKey = hasServerKey(provider.id);
  const helpText = serverHasKey
    ? `Server key available for ${provider.label}. Paste a key here only if you want to override it.`
    : `Required for ${provider.label} when no server key is configured.`;

  return (
    <section className="profile-panel overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-5 text-left transition hover:bg-zinc-900/40 md:px-6 md:py-5"
        aria-expanded={open}
      >
        <div className="flex min-w-0 items-center gap-2">
          <KeyRound className="h-4 w-4 shrink-0 text-sky-400" strokeWidth={2} />
          <div className="min-w-0">
            <h2 className="profile-section-title font-heading font-semibold text-zinc-100">Advanced API keys</h2>
            <p className="profile-section-body mt-1 truncate text-zinc-500">
              {configuredCount > 0
                ? `${configuredCount} key${configuredCount === 1 ? '' : 's'} saved locally`
                : 'Optional BYOK. Expand to add keys.'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-1.5 text-xs text-zinc-500 sm:inline-flex">
            <Lock className="h-3.5 w-3.5" />
            Local only
          </span>
          <ChevronDown
            className={`h-4 w-4 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </div>
      </button>

      {open ? (
        <div className="border-t border-zinc-800/80 px-5 pb-6 pt-5 md:px-6">
          <p className="profile-section-body mb-5 text-zinc-400">
            Choose a provider, paste your key, and verify it before tuning on the workspace.
          </p>

          <label className="mb-4 flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Provider</span>
            <Select
              value={activeProvider}
              onChange={setActiveProvider}
              options={PROVIDERS.map((p) => ({ value: p.id, label: p.label }))}
            />
          </label>

          <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/35 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-zinc-200">{provider.label}</p>
              {serverHasKey ? (
                <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-300">
                  Server fallback
                </span>
              ) : (
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                  BYOK
                </span>
              )}
            </div>
            <ApiKeyField
              label={provider.keyLabel}
              value={slot.hydrated ? slot.value : ''}
              onChange={slot.setValue}
              helpText={helpText}
              disabled={!slot.hydrated}
              provider={provider.id}
              placeholder={provider.placeholder}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
