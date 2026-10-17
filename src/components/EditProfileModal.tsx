'use client';

import { useState } from 'react';
import { Check, Mail, Pencil, User, X } from 'lucide-react';
import { getSessionUser } from '@/lib/client/authSession';
import { getSupabaseClient } from '@/lib/client/supabase';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail?: string;
  currentUsername?: string | null;
  onUsernameUpdate?: (newUsername: string) => void;
}

const inputCls =
  'block w-full rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 transition focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20';

type EditProfileModalPanelProps = Omit<EditProfileModalProps, 'isOpen'>;

function EditProfileModalPanel({
  onClose,
  currentEmail = '',
  currentUsername = '',
  onUsernameUpdate,
}: EditProfileModalPanelProps) {
  const [newUsername, setNewUsername] = useState(currentUsername ?? '');
  const [newEmail, setNewEmail] = useState(currentEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailVerificationPending, setEmailVerificationPending] = useState(false);

  const hasChanges =
    newUsername.trim() !== (currentUsername ?? '').trim() ||
    newEmail.trim().toLowerCase() !== (currentEmail ?? '').trim().toLowerCase();

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    const supabase = getSupabaseClient();
    if (!supabase) { setLoading(false); return; }

    const { user } = await getSessionUser(supabase);
    if (!user) { setError('Not signed in.'); setLoading(false); return; }

    const trimmedName  = newUsername.trim();
    const trimmedEmail = newEmail.trim().toLowerCase();
    const nameChanged  = trimmedName  !== (currentUsername ?? '').trim();
    const emailChanged = trimmedEmail !== (currentEmail ?? '').trim().toLowerCase();

    /* ── 1. Username ── */
    if (nameChanged) {
      if (trimmedName.length < 3) {
        setError('Name must be at least 3 characters.');
        setLoading(false);
        return;
      }

      const { data: existing } = await supabase
        .from('personal_info')
        .select('id')
        .ilike('username', trimmedName)
        .neq('id', user.id)
        .maybeSingle();

      if (existing) {
        setError('That name is already taken. Please choose another.');
        setLoading(false);
        return;
      }

      const { error: dbErr } = await supabase
        .from('personal_info')
        .update({ username: trimmedName })
        .eq('id', user.id);

      if (dbErr) { setError(dbErr.message); setLoading(false); return; }

      await supabase.auth.updateUser({ data: { username: trimmedName } });
      onUsernameUpdate?.(trimmedName);
    }

    /* ── 2. Email ── */
    if (emailChanged) {
      if (!trimmedEmail.includes('@')) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
      }

      // Server-side uniqueness check (admin client required)
      const checkRes = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, currentUserId: user.id }),
      });
      const checkData = await checkRes.json() as { exists?: boolean; error?: string };

      if (!checkRes.ok || checkData.error) {
        setError(checkData.error ?? 'Could not verify email. Try again.');
        setLoading(false);
        return;
      }
      if (checkData.exists) {
        setError('That email is already registered. Please use a different one.');
        setLoading(false);
        return;
      }

      // Verification link goes to the new address. If the OLD inbox also gets a message,
      // disable "Secure email change" in Supabase → Authentication → Emails (hosted project).
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error: emailErr } = await supabase.auth.updateUser(
        { email: trimmedEmail },
        { emailRedirectTo: origin ? `${origin}/` : undefined },
      );
      if (emailErr) { setError(emailErr.message); setLoading(false); return; }

      setEmailVerificationPending(true);
    }

    setLoading(false);
    setSuccess(
      emailChanged
        ? `${nameChanged ? 'Name updated! ' : ''}Verification link sent to ${newEmail.trim()}. Click it to confirm. Your password stays the same.`
        : 'Name updated successfully!',
    );
  };

  return (
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/60">

        {/* Gradient top bar */}
        <div className="h-px w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/15">
              <Pencil className="h-3.5 w-3.5 text-violet-400" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-100">Edit Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-5">
          {/* Name */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              <User className="h-3 w-3" /> Name
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => { setNewUsername(e.target.value); setError(null); setSuccess(null); }}
              placeholder="Your display name"
              className={inputCls}
              disabled={loading || emailVerificationPending}
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              <Mail className="h-3 w-3" /> Email
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => { setNewEmail(e.target.value); setError(null); setSuccess(null); }}
              placeholder="you@example.com"
              className={inputCls}
              disabled={loading || emailVerificationPending}
            />
            {emailVerificationPending && (
              <p className="mt-1.5 text-xs text-amber-400">
                Waiting for email verification. Check your inbox.
              </p>
            )}
          </div>

          {/* Status messages */}
          {error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || !hasChanges || emailVerificationPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-flex gap-1">
                    <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-white" />
                    <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-white" />
                    <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  Saving…
                </span>
              ) : (
                'Save changes'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
  );
}

export function EditProfileModal({
  isOpen,
  onClose,
  currentEmail = '',
  currentUsername = '',
  onUsernameUpdate,
}: EditProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <EditProfileModalPanel
        key={`${currentEmail}-${currentUsername ?? ''}`}
        onClose={onClose}
        currentEmail={currentEmail}
        currentUsername={currentUsername}
        onUsernameUpdate={onUsernameUpdate}
      />
    </div>
  );
}
