'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/client/supabase';
import { getUserProfile } from '@/lib/client/userProfile';
import { readCachedAvatar, writeCachedAvatar } from '@/lib/robotAvatar';

export interface NavProfile {
  userId: string;
  userEmail: string;
  username: string | null;
  avatarUrl: string | null;
}

export function useNavProfile() {
  const [profile, setProfile] = useState<NavProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    async function loadFromSession() {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user || cancelled) return;

      const [profileRow, infoResult] = await Promise.all([
        getUserProfile(user.id),
        supabase.from('personal_info').select('username').eq('id', user.id).maybeSingle(),
      ]);

      const username =
        (infoResult.data?.username as string | undefined) ||
        (user.user_metadata?.username as string | undefined) ||
        profileRow?.display_name ||
        null;

      const avatarUrl = profileRow?.avatar_url ?? null;
      writeCachedAvatar(user.id, avatarUrl);

      if (cancelled) return;
      setProfile({
        userId: user.id,
        userEmail: user.email ?? profileRow?.email ?? '',
        username,
        avatarUrl,
      });
    }

    void loadFromSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void loadFromSession();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const onAvatarUpdated = () => {
      setProfile((prev) => {
        if (!prev) return prev;
        return { ...prev, avatarUrl: readCachedAvatar(prev.userId) };
      });
    };
    window.addEventListener('pp-avatar-updated', onAvatarUpdated);
    return () => window.removeEventListener('pp-avatar-updated', onAvatarUpdated);
  }, []);

  return profile;
}
