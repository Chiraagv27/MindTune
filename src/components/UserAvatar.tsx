'use client';

import { resolveAvatarSrc } from '@/lib/robotAvatar';

interface UserAvatarProps {
  userId?: string;
  email?: string;
  username?: string | null;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
}

export function UserAvatar({ userId, email, username, avatarUrl, size = 64, className = '' }: UserAvatarProps) {
  const seed = email || username || userId || 'mindtune';
  const src = resolveAvatarSrc(seed, avatarUrl, userId, size);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`rounded-lg object-cover ring-1 ring-zinc-200 dark:ring-zinc-700 ${className}`}
    />
  );
}
