'use client';

import { useState } from 'react';
import { MindTuneShell } from '@/components/MindTuneShell';
import { getSupabaseClient } from '@/lib/client/supabase';
import { appInputClass, btnPrimary } from '@/lib/ui/classes';

export function UpdatePassword({ onComplete }: { onComplete: () => void }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MindTuneShell>
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="landing-panel landing-panel-elevated w-full max-w-md space-y-6 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">Set new password</h2>
            <p className="mt-2 text-sm text-zinc-400">Please enter your new password below.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={appInputClass}
                placeholder="New password"
                minLength={6}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-rose-900/50 bg-rose-950/40 p-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className={`${btnPrimary} w-full py-3`}>
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </MindTuneShell>
  );
}
