'use client';

import { useState } from 'react';
import { getSessionUser } from '@/lib/client/authSession';
import { getSupabaseClient } from '@/lib/client/supabase';
import { X, Trash2, LogOut, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function SettingsModal({ isOpen, onClose, onLogout }: SettingsModalProps) {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { user } = await getSessionUser(supabase);
      if (!user) throw new Error('No user found');

      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Failed to delete account');
      }

      onLogout();
      onClose();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/60">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
          <h2 className="text-lg font-semibold text-zinc-50">Settings</h2>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">

          {/* Account Actions */}
          <section>
            <h3 className="mb-1 text-sm font-semibold text-zinc-100">Account</h3>
            <p className="mb-4 text-xs text-zinc-500">Manage your session.</p>
            <button
              onClick={() => { onLogout(); onClose(); }}
              className="flex w-full items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </section>

          <div className="border-t border-zinc-800" />

          {/* Danger Zone */}
          <section>
            <h3 className="mb-1 text-sm font-semibold text-rose-400">Danger Zone</h3>
            <p className="mb-4 text-xs text-zinc-500">
              Permanently delete your account and all associated data.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex w-full items-center gap-2.5 rounded-xl border border-rose-900/50 bg-rose-950/30 px-4 py-3 text-sm font-medium text-rose-400 transition hover:bg-rose-950/50"
              >
                <Trash2 className="h-4 w-4" />
                Delete my account
              </button>
            ) : (
              <div className="rounded-xl border border-rose-900/50 bg-rose-950/30 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-rose-200">Are you absolutely sure?</p>
                    <p className="mt-1 text-xs text-rose-300/80">
                      This will immediately delete your account, prompt history, and all settings.
                      This cannot be undone.
                    </p>
                    {deleteError && (
                      <p className="mt-2 text-xs text-rose-400">{deleteError}</p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading}
                        className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                      >
                        {deleteLoading ? 'Deleting…' : 'Yes, delete everything'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deleteLoading}
                        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
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
    </div>
  );
}
