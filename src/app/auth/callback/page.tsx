'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MindTuneShell } from '@/components/MindTuneShell';
import { completeOAuthRedirect } from '@/lib/client/supabase';

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    completeOAuthRedirect().then(({ error: message }) => {
      if (message === 'SIGNUP_REQUIRED') {
        window.location.replace('/?auth=login&error=signup_required');
        return;
      }
      if (message) {
        setError(message);
        return;
      }
      window.location.replace('/');
    });
  }, []);

  return (
    <MindTuneShell>
      <div className="flex min-h-screen items-center justify-center px-4">
        {error ? (
          <div className="landing-panel w-full max-w-md p-6 text-sm text-rose-200">
            <p>{error}</p>
            <Link href="/?auth=login" className="mt-4 inline-block font-semibold text-sky-400 hover:text-sky-300">
              Back to login
            </Link>
          </div>
        ) : (
          <p className="text-sm text-zinc-400">Signing you in…</p>
        )}
      </div>
    </MindTuneShell>
  );
}
