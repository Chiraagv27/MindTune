'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/client/supabase';
import type { AppAuthSession } from '@/lib/types';

/**
 * Email shown in the UI. Uses session email first; updates from auth events without getUser().
 */
export function useAuthUserEmail(session: AppAuthSession) {
  const sessionEmail = session.user.email ?? '';
  const userId = session.user.id;
  const [override, setOverride] = useState<{ userId: string; email: string } | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const nextEmail = nextSession?.user?.email;
      if (nextEmail) setOverride({ userId, email: nextEmail });
    });

    return () => subscription.unsubscribe();
  }, [userId]);

  return override?.userId === userId ? override.email : sessionEmail;
}
