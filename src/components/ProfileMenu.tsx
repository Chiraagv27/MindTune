'use client';

import Link from 'next/link';
import { useState } from 'react';
import { appBarIconBtn } from '@/lib/ui/classes';
import { UserAvatar } from '@/components/UserAvatar';

interface ProfileMenuProps {
  userId?: string;
  userEmail?: string;
  username?: string | null;
  avatarUrl?: string | null;
}

export function ProfileMenu({ userId, userEmail, username, avatarUrl }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const hasIdentity = Boolean(userId && (userEmail || username));
  const greetingName =
    username?.trim() || userEmail?.split('@')[0]?.trim() || 'there';

  if (!hasIdentity) {
    return (
      <Link href="/?auth=login" className={`${appBarIconBtn} opacity-80 hover:opacity-100`} title="Sign in">
        <UserAvatar size={32} className="h-full w-full !ring-0 rounded-full" />
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${appBarIconBtn}${open ? ' border-sky-500/50 bg-zinc-800' : ''}`.trim()}
        title="Profile"
        aria-expanded={open}
      >
        <UserAvatar
          userId={userId}
          email={userEmail}
          username={username}
          avatarUrl={avatarUrl}
          size={32}
          className="h-full w-full !ring-0 rounded-full"
        />
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start gap-3">
              <UserAvatar
                userId={userId}
                email={userEmail}
                username={username}
                avatarUrl={avatarUrl}
                size={48}
                className="h-12 w-12 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Hi {greetingName}!
                </div>
                {userEmail ? (
                  <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{userEmail}</div>
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
