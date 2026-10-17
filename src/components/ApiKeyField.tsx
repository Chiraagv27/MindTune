'use client';

import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { ProviderId } from '@/lib/types';

type VerifyStatus = 'idle' | 'loading' | 'valid' | 'invalid';

interface ApiKeyFieldProps {
  value: string;
  onChange: (value: string) => void;
  helpText: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  provider?: ProviderId;
}

export function ApiKeyField({
  value,
  onChange,
  helpText,
  disabled,
  label = 'BYOK API key (optional)',
  placeholder = 'Paste key here',
  provider,
}: ApiKeyFieldProps) {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<VerifyStatus>('idle');
  const [reason, setReason] = useState<string | null>(null);

  const handleChange = (v: string) => {
    onChange(v);
    // Reset status when the key is changed
    if (status !== 'idle') {
      setStatus('idle');
      setReason(null);
    }
  };

  const handleVerify = async () => {
    if (!value.trim() || !provider) return;
    setStatus('loading');
    setReason(null);
    try {
      const res = await fetch('/api/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: value.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setStatus('valid');
      } else {
        setStatus('invalid');
        setReason(data.reason ?? 'Key verification failed.');
      }
    } catch {
      setStatus('invalid');
      setReason('Could not reach the server. Check your connection.');
    }
  };

  const canVerify = Boolean(value.trim()) && Boolean(provider) && status !== 'loading';

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium tracking-wide text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      <div className="relative">
        <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="h-11 w-full rounded-2xl border border-zinc-200 bg-white/70 pl-10 pr-10 text-sm text-zinc-900 shadow-sm backdrop-blur outline-none transition focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-50"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100/80 hover:text-zinc-700 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-300"
          tabIndex={-1}
          aria-label={show ? 'Hide key' : 'Show key'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {/* Test button row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleVerify}
          disabled={!canVerify || disabled}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          {status === 'loading' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <KeyRound className="h-3.5 w-3.5" />
          )}
          {status === 'loading' ? 'Verifying…' : 'Verify'}
        </button>

        {status === 'valid' && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Valid key
          </span>
        )}
        {status === 'invalid' && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
            <XCircle className="h-3.5 w-3.5" />
            {reason ?? 'Invalid key'}
          </span>
        )}
      </div>

      <span className="text-xs text-zinc-500 dark:text-zinc-400">{helpText}</span>
    </div>
  );
}
