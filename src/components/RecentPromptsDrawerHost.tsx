'use client';

import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import type { HistoryItem } from '@/components/HistoryPanel';
import { getSessionUser } from '@/lib/client/authSession';
import { getSupabaseClient } from '@/lib/client/supabase';
import {
  RECENT_DRAWER_OPEN,
  RECENT_HISTORY_SELECT,
  RECENT_NEW_OPTIMIZER,
  consumeLegacyOpenRecentFlag,
  emitRecentDrawerOpenChange,
  requestNewOptimizerPrompt,
  stashHistoryPick,
} from '@/lib/recentDrawer';

const HistoryPanel = dynamic(
  () => import('@/components/HistoryPanel').then((mod) => mod.HistoryPanel),
  { ssr: false },
);

export function RecentPromptsDrawerHost() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(() =>
    typeof window !== 'undefined' ? consumeLegacyOpenRecentFlag() : false,
  );
  const [userId, setUserId] = useState<string | null>(null);

  const setOpen = useCallback((open: boolean) => {
    setIsOpen(open);
    emitRecentDrawerOpenChange(open);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    void getSessionUser(supabase).then(({ user }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    router.prefetch('/');
  }, [router]);

  useEffect(() => {
    const goOptimizerForNewPrompt = () => {
      if (window.location.pathname !== '/') {
        router.replace('/');
      }
    };
    window.addEventListener(RECENT_NEW_OPTIMIZER, goOptimizerForNewPrompt);
    return () => window.removeEventListener(RECENT_NEW_OPTIMIZER, goOptimizerForNewPrompt);
  }, [router]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(RECENT_DRAWER_OPEN, onOpen);
    return () => window.removeEventListener(RECENT_DRAWER_OPEN, onOpen);
  }, [setOpen]);

  const handleSelect = useCallback(
    (item: HistoryItem) => {
      if (pathname === '/') {
        window.dispatchEvent(new CustomEvent(RECENT_HISTORY_SELECT, { detail: item }));
      } else {
        stashHistoryPick(item);
        router.push('/');
      }
      setOpen(false);
    },
    [pathname, router, setOpen],
  );

  const handleNewPrompt = useCallback(() => {
    requestNewOptimizerPrompt();
    setOpen(false);
  }, [setOpen]);

  if (!userId) return null;

  return (
    <HistoryPanel
      userId={userId}
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      onSelect={handleSelect}
      onNewPrompt={handleNewPrompt}
    />
  );
}
