'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, LogOut, Trash2 } from 'lucide-react';

import { AppBar } from '@/components/AppBar';
import { ProfileSettingsCard } from '@/components/settings/ProfileSettingsCard';
import { SettingsApiKeysPanel } from '@/components/settings/SettingsApiKeysPanel';
import { SettingsUsageCharts } from '@/components/settings/SettingsUsageCharts';
import { MindTuneShell } from '@/components/MindTuneShell';
import { writeCachedAvatar } from '@/lib/robotAvatar';
import { getSessionUser } from '@/lib/client/authSession';
import { getSupabaseClient } from '@/lib/client/supabase';
import {
  getUserProfile,
  getUserStats,
  type UserAnalytics,
  type UserProfile,
} from '@/lib/client/userProfile';

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<UserAnalytics>({
    total: 0,
    favoriteMode: null,
    favoriteProvider: null,
    modeBreakdown: [],
    providerBreakdown: [],
    dailyRuns: [],
    growthPercent: null,
  });
  const [username, setUsername] = useState('');
  const [savedUsername, setSavedUsername] = useState('');
  const [email, setEmail] = useState('');
  const [savedEmail, setSavedEmail] = useState('');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileSaveVersion, setProfileSaveVersion] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { user } = await getSessionUser(supabase);
      if (!user) {
        router.replace('/?auth=1');
        return;
      }
      setUserId(user.id);

      const [profileData, statsData, infoResult] = await Promise.all([
        getUserProfile(user.id),
        getUserStats(user.id),
        supabase.from('personal_info').select('username').eq('id', user.id).maybeSingle(),
      ]);
      if (profileData) {
        setProfile(profileData);
        writeCachedAvatar(user.id, profileData.avatar_url);
      }
      const savedUsernameValue = (infoResult.data?.username as string | null) || profileData?.display_name || '';
      const savedMail = (user.email || profileData?.email || '').trim().toLowerCase();
      setUsername(savedUsernameValue);
      setSavedUsername(savedUsernameValue);
      setEmail(savedMail);
      setSavedEmail(savedMail);
      setStats(statsData);
      setLoading(false);
    }

    void load();
  }, [router]);

  useEffect(() => {
    if (!profile?.id) return;
    const onAvatarUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }>).detail;
      if (detail?.userId && detail.userId !== profile.id) return;
      void getUserProfile(profile.id).then((next) => {
        if (!next) return;
        setProfile(next);
        writeCachedAvatar(profile.id, next.avatar_url);
      });
    };
    window.addEventListener('pp-avatar-updated', onAvatarUpdated);
    return () => window.removeEventListener('pp-avatar-updated', onAvatarUpdated);
  }, [profile?.id]);

  const syncAccount = async (nextUsername: string) => {
    const supabase = getSupabaseClient();
    const session = supabase ? (await supabase.auth.getSession()).data.session : null;
    if (!session) throw new Error('Sign in required.');
    const res = await fetch('/api/auth/sync-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ username: nextUsername }),
    });
    const body = (await res.json().catch(() => null)) as { error?: string; email?: string } | null;
    if (!res.ok) throw new Error(body?.error || 'Could not update your account.');
    return body?.email ?? '';
  };

  const handleSave = async () => {
    if (!profile || saving) return;
    setSaving(true);
    setSaveError(null);

    const nextUsername = username.trim();
    const nextEmail = email.trim().toLowerCase();
    const emailChanged = nextEmail !== savedEmail;

    if (nextUsername.length < 3) {
      setSaveError('Username must be at least 3 characters.');
      setSaving(false);
      return;
    }
    if (emailChanged && !nextEmail.includes('@')) {
      setSaveError('Please enter a valid email address.');
      setSaving(false);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setSaveError('Supabase client not initialized');
      setSaving(false);
      return;
    }

    try {
      if (emailChanged) {
        const session = (await supabase.auth.getSession()).data.session;
        const checkRes = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token ?? ''}`,
          },
          body: JSON.stringify({ email: nextEmail }),
        });
        const checkData = (await checkRes.json()) as { exists?: boolean; error?: string };
        if (!checkRes.ok || checkData.error) throw new Error(checkData.error || 'Could not verify that email.');
        if (checkData.exists) throw new Error('Another MindTune account already uses that email.');
      }

      const syncedEmail = await syncAccount(nextUsername);
      setUsername(nextUsername);
      setSavedUsername(nextUsername);
      setProfile({
        ...profile,
        display_name: nextUsername,
        email: syncedEmail || profile.email,
      });

      if (!emailChanged) {
        setProfileSaveVersion((v) => v + 1);
        setSaving(false);
        return;
      }

      const { user: authUser } = await getSessionUser(supabase);
      const alreadyPending = (authUser as { new_email?: string | null } | null)?.new_email?.trim().toLowerCase();
      if (alreadyPending !== nextEmail) {
        const { error: emailError } = await supabase.auth.updateUser({ email: nextEmail });
        if (emailError) {
          const message = emailError.message.toLowerCase();
          if (message.includes('rate limit')) {
            throw new Error('Too many emails were sent. Use the latest code or wait about an hour.');
          }
          throw emailError;
        }
      }
      setPendingEmail(nextEmail);
      setVerificationCode('');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save your changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!profile || !pendingEmail || saving) return;
    const token = verificationCode.trim();
    if (!/^\d{6}$/.test(token)) {
      setSaveError('Enter the 6-digit code from your new email.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    const supabase = getSupabaseClient();
    if (!supabase) {
      setSaveError('Supabase client not initialized');
      setSaving(false);
      return;
    }

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token,
        type: 'email_change',
      });
      if (error) throw error;

      const syncedEmail = await syncAccount(username.trim());
      const confirmed = syncedEmail || pendingEmail;
      setEmail(confirmed);
      setSavedEmail(confirmed.trim().toLowerCase());
      setSavedUsername(username.trim());
      setProfile({ ...profile, email: confirmed, display_name: username.trim() });
      setPendingEmail(null);
      setVerificationCode('');
      setProfileSaveVersion((v) => v + 1);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'That code did not match.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    if (!profile) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || 'Failed to delete account');
      }
      const supabase = getSupabaseClient();
      if (supabase) await supabase.auth.signOut();
      router.push('/');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleteLoading(false);
    }
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

  if (!profile || !userId) {
    return (
      <MindTuneShell>
        <div className="flex min-h-screen items-center justify-center px-4">
          <p className="text-center text-sm text-zinc-500">Could not load your profile right now.</p>
        </div>
      </MindTuneShell>
    );
  }

  return (
    <MindTuneShell>
      <AppBar active="settings" />
      <main className="profile-settings-page landing-content-wide relative z-10 py-7 md:py-9">
        <header className="profile-page-header mb-5 border-b border-zinc-800/80 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">Profile</h1>
          <div className="profile-sync-pill">
            <span className="profile-sync-dot" aria-hidden />
            Synced
          </div>
        </header>

        <div className="profile-settings-stack flex flex-col">
          <ProfileSettingsCard
            profile={profile}
            username={username}
            savedUsername={savedUsername}
            email={email}
            savedEmail={savedEmail}
            pendingEmail={pendingEmail}
            verificationCode={verificationCode}
            saving={saving}
            saveError={saveError}
            optimizationCount={stats.total}
            profileSaveVersion={profileSaveVersion}
            onUsernameChange={setUsername}
            onEmailChange={setEmail}
            onVerificationCodeChange={setVerificationCode}
            onSave={() => void handleSave()}
            onVerifyEmail={() => void handleVerifyEmail()}
            onCancelEmailPending={() => {
              setUsername(savedUsername);
              setEmail(savedEmail);
              setPendingEmail(null);
              setVerificationCode('');
              setSaveError(null);
            }}
            onProfileUpdate={setProfile}
            onReportError={setSaveError}
          />

          <SettingsUsageCharts stats={stats} />

          <SettingsApiKeysPanel userId={userId} />

          <div className="profile-session-danger-grid">
            <section className="profile-session-panel">
              <h2 className="profile-section-title font-heading font-semibold text-sky-300">Session</h2>
              <p className="profile-section-body mt-2 text-zinc-400">
                Sign out on this device. Your saved prompts and history stay in your account.
              </p>
              <div className="profile-session-actions">
                <button type="button" onClick={() => void handleSignOut()} className="profile-signout-btn">
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign out
                </button>
              </div>
            </section>

            <section className="profile-danger-panel">
              <h2 className="profile-section-title font-heading font-semibold text-rose-300">Danger Zone</h2>
              <p className="profile-danger-copy profile-section-body mt-2 text-zinc-400">
                Permanently delete your account. This cannot be undone.
              </p>
              {!showDeleteConfirm ? (
                <div className="profile-danger-actions">
                  <button type="button" onClick={() => setShowDeleteConfirm(true)} className="profile-delete-trigger">
                    <Trash2 className="h-4 w-4 shrink-0" />
                    Delete my account
                  </button>
                </div>
              ) : (
                <div className="profile-delete-confirm profile-danger-actions">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-rose-200">Are you absolutely sure?</p>
                      <p className="mt-1 text-xs text-rose-200/70">Everything tied to this account will be removed immediately.</p>
                      {deleteError ? <p className="mt-2 text-xs text-rose-400">{deleteError}</p> : null}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void handleDeleteAccount()}
                          disabled={deleteLoading}
                          className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                          {deleteLoading ? 'Deleting…' : 'Yes, delete everything'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={deleteLoading}
                          className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </MindTuneShell>
  );
}
