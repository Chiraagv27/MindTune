'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Clock, Zap } from 'lucide-react';

import { AppBar } from '@/components/AppBar';
import { MindTuneShell } from '@/components/MindTuneShell';
import { appInputClass, btnPrimary } from '@/lib/ui/classes';
import { robotAvatarUrl, usableAvatarUrl } from '@/lib/robotAvatar';
import { getSessionUser } from '@/lib/client/authSession';
import { getSupabaseClient } from '@/lib/client/supabase';
import {
  getUserProfile,
  getUserStats,
  updateUserProfile,
  type UserProfile,
} from '@/lib/client/userProfile';

const inputClass = appInputClass;

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    favoriteMode: null as string | null,
    favoriteProvider: null as string | null,
  });
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { user } = await getSessionUser(supabase);

      if (!user) {
        router.push('/?auth=1');
        return;
      }

      const [profileData, statsData] = await Promise.all([getUserProfile(user.id), getUserStats(user.id)]);
      if (profileData) {
        setProfile(profileData);
        setDisplayName(profileData.display_name ?? '');
        setAvatarUrl(profileData.avatar_url ?? '');
      }
      setStats(statsData);
      setLoading(false);
    }

    void load();
  }, [router]);

  const optimizationCount = stats.total;

  const handleSave = async () => {
    if (!profile || saving) return;
    setSaving(true);
    setSaveError(null);

    const nextDisplayName = displayName.trim();
    const nextAvatar = avatarUrl.trim();

    const { error } = await updateUserProfile(profile.id, {
      display_name: nextDisplayName,
      avatar_url: nextAvatar.length > 0 ? nextAvatar : null,
    });

    if (error) {
      setSaveError(error.message);
      setSaving(false);
      return;
    }

    setProfile({
      ...profile,
      display_name: nextDisplayName,
      avatar_url: nextAvatar.length > 0 ? nextAvatar : null,
    });
    setEditing(false);
    setSaving(false);
  };

  if (loading) {
    return (
      <MindTuneShell>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-sky-400" />
        </div>
      </MindTuneShell>
    );
  }

  if (!profile) {
    return (
      <MindTuneShell>
        <div className="flex min-h-screen items-center justify-center px-4">
          <p className="text-center text-sm text-zinc-500">Could not load your profile right now.</p>
        </div>
      </MindTuneShell>
    );
  }

  const avatarSrc = usableAvatarUrl(profile.avatar_url) || robotAvatarUrl(profile.email || profile.id);

  return (
    <MindTuneShell>
      <AppBar active="settings" />
      <main className="landing-content relative z-10 flex w-full max-w-3xl flex-col py-8 md:py-10">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">Profile</h1>

        <div className="flex min-h-0 flex-1 flex-col gap-4">
        <section className="landing-panel p-4 md:p-5">
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarSrc} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-violet-200 dark:ring-violet-500/30" />

            <div className="min-w-0 flex-1">
              {editing ? (
                <div className="space-y-3">
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display name"
                    className={inputClass}
                  />
                  <input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Avatar URL"
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className={`${btnPrimary} disabled:opacity-50`}
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setDisplayName(profile.display_name ?? '');
                        setAvatarUrl(profile.avatar_url ?? '');
                        setSaveError(null);
                      }}
                      className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                  </div>
                  {saveError ? <p className="text-xs text-rose-500">{saveError}</p> : null}
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-xl font-semibold">{profile.display_name || 'User'}</h2>
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-600 transition hover:border-violet-300 hover:text-violet-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-violet-700 dark:hover:text-violet-300"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="mt-1 truncate text-sm text-zinc-500">{profile.email}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Member since {new Date(profile.created_at).toLocaleDateString()} · {optimizationCount} optimizations
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: BarChart3, value: String(stats.total), label: 'Optimizations' },
            { icon: Zap, value: stats.favoriteMode || '-', label: 'Favorite mode' },
            { icon: Clock, value: stats.favoriteProvider || '-', label: 'Most used provider' },
          ].map((item) => (
            <div
              key={item.label}
              className="landing-panel min-w-0 px-2 py-3 text-center"
            >
              <item.icon className="mx-auto mb-1 h-5 w-5 text-sky-400" />
              <p className="truncate font-heading text-lg font-bold capitalize">{item.value}</p>
              <p className="truncate text-xs text-zinc-500">{item.label}</p>
            </div>
          ))}
        </div>
        </div>
      </main>
    </MindTuneShell>
  );
}
