'use client';

import { useEffect, useRef, useState } from 'react';
import { Mail, Pencil, RefreshCw, User } from 'lucide-react';

import { UserAvatar } from '@/components/UserAvatar';
import { btnPrimary, btnSecondary } from '@/lib/ui/classes';
import { preloadRobot, usableAvatarUrl, writeCachedAvatar } from '@/lib/robotAvatar';
import { updateUserProfile, type UserProfile } from '@/lib/client/userProfile';

const inputClass =
  'block h-12 w-full rounded-lg border border-zinc-700 bg-zinc-900/80 px-3.5 py-2.5 text-[0.9375rem] leading-normal text-zinc-100 placeholder-zinc-500 transition focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20';

function robotSaveMessage(message: string) {
  const text = message.toLowerCase();
  if (text.includes('robot_taken') || text.includes('robot_hash')) {
    return 'That avatar is already used by another account. Try another one.';
  }
  return message;
}

interface ProfileSettingsCardProps {
  profile: UserProfile;
  username: string;
  savedUsername: string;
  email: string;
  savedEmail: string;
  pendingEmail: string | null;
  verificationCode: string;
  saving: boolean;
  saveError: string | null;
  optimizationCount: number;
  profileSaveVersion: number;
  onUsernameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onVerificationCodeChange: (value: string) => void;
  onSave: () => void;
  onVerifyEmail: () => void;
  onCancelEmailPending: () => void;
  onProfileUpdate: (next: UserProfile) => void;
  onReportError: (message: string) => void;
}

export function ProfileSettingsCard({
  profile,
  username,
  savedUsername,
  email,
  savedEmail,
  pendingEmail,
  verificationCode,
  saving,
  saveError,
  optimizationCount,
  profileSaveVersion,
  onUsernameChange,
  onEmailChange,
  onVerificationCodeChange,
  onSave,
  onVerifyEmail,
  onCancelEmailPending,
  onProfileUpdate,
  onReportError,
}: ProfileSettingsCardProps) {
  const [editing, setEditing] = useState(false);
  const [robotPick, setRobotPick] = useState<string | null>(null);
  const [robotLoading, setRobotLoading] = useState(false);
  const nextRobot = useRef<string | null>(null);

  const displayEmail = pendingEmail ? savedEmail : email || profile.email;
  const memberSince = new Date(profile.created_at).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const previewAvatarUrl = robotPick ?? profile.avatar_url;

  const fetchFreeRobot = async () => {
    const { getSupabaseClient } = await import('@/lib/client/supabase');
    const supabase = getSupabaseClient();
    const session = supabase ? (await supabase.auth.getSession()).data.session : null;
    if (!session) throw new Error('Sign in required.');
    const res = await fetch('/api/auth/next-robot', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const body = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
    if (!res.ok || !body?.url) throw new Error(body?.error || 'Could not load a new avatar.');
    return body.url;
  };

  useEffect(() => {
    if (profileSaveVersion > 0) {
      setEditing(false);
      setRobotPick(null);
    }
  }, [profileSaveVersion]);

  useEffect(() => {
    let cancelled = false;
    void fetchFreeRobot()
      .then(async (url) => {
        await preloadRobot(url);
        if (!cancelled) nextRobot.current = url;
      })
      .catch(() => {
        if (!cancelled) nextRobot.current = null;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshRobot = async () => {
    if (robotLoading) return;
    setRobotLoading(true);
    try {
      let url = nextRobot.current;
      nextRobot.current = null;
      if (!url) url = await fetchFreeRobot();
      await preloadRobot(url);
      setRobotPick(url);
      void fetchFreeRobot()
        .then(async (upcoming) => {
          await preloadRobot(upcoming);
          nextRobot.current = upcoming;
        })
        .catch(() => {
          nextRobot.current = null;
        });
    } catch {
      // parent shows saveError if needed on save
    } finally {
      setRobotLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setRobotPick(null);
    onUsernameChange(savedUsername);
    onEmailChange(savedEmail);
  };

  const persistAvatarIfNeeded = async (): Promise<UserProfile> => {
    if (!robotPick) return profile;
    const { error } = await updateUserProfile(profile.id, { avatar_url: robotPick });
    if (error) throw new Error(robotSaveMessage(error.message));
    writeCachedAvatar(profile.id, robotPick);
    const next = { ...profile, avatar_url: robotPick };
    onProfileUpdate(next);
    setRobotPick(null);
    return next;
  };

  const handleSaveClick = async () => {
    try {
      await persistAvatarIfNeeded();
      onSave();
    } catch (err) {
      onReportError(err instanceof Error ? err.message : 'Could not save your avatar.');
    }
  };

  const handleVerifyClick = async () => {
    try {
      await persistAvatarIfNeeded();
      onVerifyEmail();
    } catch (err) {
      onReportError(err instanceof Error ? err.message : 'Could not save your avatar.');
    }
  };

  return (
    <section className="profile-panel profile-panel-identity">
      {!pendingEmail && !editing ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`profile-edit-floating ${btnSecondary} inline-flex items-center gap-1.5 px-3 py-1.5 text-xs`}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit profile
        </button>
      ) : null}

      <div className="profile-identity-grid">
        <div className="profile-avatar-block">
          <div className="relative">
            <UserAvatar
              userId={profile.id}
              email={displayEmail}
              username={username || profile.display_name}
              avatarUrl={previewAvatarUrl}
              size={132}
              className="profile-avatar-img !rounded-2xl !ring-zinc-700"
            />
            {editing && !pendingEmail ? (
              <button
                type="button"
                onClick={() => void refreshRobot()}
                disabled={robotLoading}
                className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-600 bg-zinc-900 text-sky-300 shadow-lg transition hover:bg-zinc-800 disabled:opacity-60"
                title="Pick another avatar"
                aria-label="Pick another avatar"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${robotLoading ? 'animate-spin' : ''}`} />
              </button>
            ) : null}
          </div>
          {editing && !pendingEmail ? (
            <p className="max-w-[8.5rem] text-center text-[11px] leading-snug text-zinc-500">
              Tap refresh for a new avatar. Saves with profile changes.
            </p>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          {pendingEmail ? (
            <div>
              <p className="text-sm text-zinc-400">
                We sent a 6-digit code to <span className="text-zinc-200">{pendingEmail}</span>. Enter it below to
                confirm your new email.
              </p>
              <label htmlFor="settings-code" className="profile-field-label mt-4">
                Email verification code
              </label>
              <input
                id="settings-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={verificationCode}
                onChange={(e) => onVerificationCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit code"
                className={`${inputClass} max-w-xs text-center tracking-[0.35em]`}
              />
              {saveError ? <p className="mt-2 text-xs text-rose-400">{saveError}</p> : null}
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={() => void handleVerifyClick()} disabled={saving} className={btnPrimary}>
                  {saving ? 'Confirming…' : 'Confirm email'}
                </button>
                <button type="button" onClick={onCancelEmailPending} className="text-sm font-semibold text-zinc-500 hover:text-zinc-200">
                  Cancel
                </button>
              </div>
            </div>
          ) : editing ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="settings-username" className="profile-field-label">
                    <User className="h-3.5 w-3.5" />
                    Username
                  </label>
                  <input
                    id="settings-username"
                    value={username}
                    onChange={(e) => onUsernameChange(e.target.value)}
                    placeholder="@your_name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="settings-email" className="profile-field-label">
                    <Mail className="h-3.5 w-3.5" />
                    Account email
                  </label>
                  <input
                    id="settings-email"
                    type="email"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-zinc-500">
                Changing email sends a one-time code to the new address before it takes effect.
              </p>
              {saveError ? <p className="mt-2 text-xs text-rose-400">{saveError}</p> : null}
              <div className="mt-5 flex flex-wrap justify-end gap-3">
                <button type="button" onClick={cancelEdit} className="text-sm font-semibold text-zinc-500 hover:text-zinc-200">
                  Cancel
                </button>
                <button type="button" onClick={() => void handleSaveClick()} disabled={saving} className={btnPrimary}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-2xl font-semibold tracking-tight text-zinc-50">
                {savedUsername || profile.display_name || 'User'}
              </p>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-zinc-400">{displayEmail}</p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                Member since {memberSince} · {optimizationCount} optimizations
              </p>
              {usableAvatarUrl(profile.avatar_url) ? null : (
                <p className="mt-2 text-xs text-zinc-600">Avatar is tied to your account email hash.</p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
