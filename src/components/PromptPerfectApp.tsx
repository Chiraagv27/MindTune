'use client';

import {
  useDeferredValue,
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from 'react';
import { OptimizerComposer, type PromptLoadRequest } from '@/components/OptimizerComposer';
import { PromptPerfectHeader } from '@/components/PromptPerfectHeader';
import { PromptPerfectOutputs } from '@/components/PromptPerfectOutputs';
import type { HistoryItem } from '@/components/HistoryPanel';
import dynamic from 'next/dynamic';
import { Auth } from '@/components/Auth';
import { useApiConfig } from '@/hooks/useApiConfig';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { useOptimizePrompt } from '@/hooks/useOptimizePrompt';
import { clearLocalAuthSession, getClientSession, isAuthNetworkError } from '@/lib/client/authSession';
import { getSupabaseClient } from '@/lib/client/supabase';
import { useAuthUserEmail } from '@/hooks/useAuthUserEmail';
import { normalizeAppMode } from '@/lib/modeStyles';
import type { AppAuthSession, Mode, OptimizeVersion, ProviderId } from '@/lib/types';

import { AppBar } from '@/components/AppBar';
import { MindTuneShell } from '@/components/MindTuneShell';
import { getUserProfile } from '@/lib/client/userProfile';
import { readCachedAvatar, writeCachedAvatar } from '@/lib/robotAvatar';
import { UpdatePassword } from '@/components/UpdatePassword';
import {
  RECENT_HISTORY_SELECT,
  RECENT_NEW_OPTIMIZER,
  consumeHistoryPick,
  consumeNewOptimizerFlag,
  registerNewOptimizerHandler,
} from '@/lib/recentDrawer';

const LandingPage = dynamic(
  () => import('@/components/LandingPage').then((mod) => mod.LandingPage),
  { ssr: false },
);

type ModeWorkspaceSnapshot = {
  promptLoad: PromptLoadRequest | null;
  tunedOriginal: string;
  initialQAMessages: { role: 'user' | 'assistant'; content: string }[];
  hideEmptyResultShell: boolean;
  provider: ProviderId;
  optimizedText: string;
  explanation: string;
  changes: string;
  sessionId: string;
  usedProvider: ProviderId | string;
  usedModel: string;
};

function workspaceHasContent(snapshot: ModeWorkspaceSnapshot): boolean {
  return Boolean(
    snapshot.tunedOriginal.trim() ||
      snapshot.optimizedText.trim() ||
      (snapshot.promptLoad?.text ?? '').trim(),
  );
}

function promptTextFromSnapshot(snapshot: ModeWorkspaceSnapshot): string {
  return snapshot.tunedOriginal.trim() || (snapshot.promptLoad?.text ?? '').trim();
}

function PromptPerfectMain({ session }: { session: AppAuthSession; onLogout: () => void }) {
  const userId = session.user.id;
  const authEmail = useAuthUserEmail(session);
  const [promptLoad, setPromptLoad] = useState<PromptLoadRequest | null>(null);
  const [tunedOriginal, setTunedOriginal] = useState('');
  const [hideEmptyResultShell, setHideEmptyResultShell] = useState(false);
  const [mode, setMode] = useState<Mode>('developer');
  // Always use v2 (Stream)
  const [version, setVersion] = useState<OptimizeVersion>('v2');
  const [provider, setProvider] = useState<ProviderId>('google');
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const modeWorkspacesRef = useRef<Partial<Record<Mode, ModeWorkspaceSnapshot>>>({});

  useEffect(() => {
    const raw = window.sessionStorage.getItem('pp_reoptimize');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { text?: unknown; mode?: unknown };
        if (typeof parsed.text === 'string') {
          setPromptLoad({ text: parsed.text, key: Date.now() });
        }
        if (typeof parsed.mode === 'string') {
          setMode(normalizeAppMode(parsed.mode));
        }
      } catch {
        // ignore
      } finally {
        window.sessionStorage.removeItem('pp_reoptimize');
      }
    }

  }, []);

  useEffect(() => {
    // First try session metadata (available immediately after signup)
    const metaUsername = session.user.user_metadata?.username as string | undefined;
    if (metaUsername) setUsername(metaUsername);

    // Then confirm/override from DB (source of truth)
    const supabase = getSupabaseClient();
    if (!supabase) return;
    supabase
      .from('personal_info')
      .select('username')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.username) setUsername(data.username);
      });
  }, [userId, session.user.user_metadata]);

  useLayoutEffect(() => {
    setAvatarUrl(readCachedAvatar(userId));
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    void getUserProfile(userId).then((profile) => {
      if (cancelled || !profile) return;
      setAvatarUrl(profile.avatar_url);
      writeCachedAvatar(userId, profile.avatar_url);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    const onAvatarUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }>).detail;
      if (detail?.userId && detail.userId !== userId) return;
      setAvatarUrl(readCachedAvatar(userId));
    };
    window.addEventListener('pp-avatar-updated', onAvatarUpdated);
    return () => window.removeEventListener('pp-avatar-updated', onAvatarUpdated);
  }, [userId]);

  const [initialQAMessages, setInitialQAMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);

  const { hasServerKey } = useApiConfig();
  
  // Separate storage for each provider's key, scoped by userId
  const googleKey = useLocalStorageState(`promptperfect:apiKey:google:${userId}`, '');
  const openaiKey = useLocalStorageState(`promptperfect:apiKey:openai:${userId}`, '');
  const anthropicKey = useLocalStorageState(`promptperfect:apiKey:anthropic:${userId}`, '');
  const groqKey = useLocalStorageState(`promptperfect:apiKey:groq:${userId}`, '');

  const currentKey =
    provider === 'google'
      ? googleKey
      : provider === 'openai'
        ? openaiKey
        : provider === 'anthropic'
          ? anthropicKey
          : groqKey;

  const {
    optimizedText,
    explanation,
    changes,
    sessionId,
    provider: usedProvider,
    model: usedModel,
    isLoading,
    error,
    optimize,
    reset,
    loadSession,
  } = useOptimizePrompt();

  const shouldShowKeyHint =
    !hasServerKey(provider) && currentKey.hydrated && currentKey.value.trim().length === 0;

  const runTune = useCallback(
    (prompt: string) => {
      setHideEmptyResultShell(false);
      setTunedOriginal(prompt);
      setInitialQAMessages([]);
      optimize({
        prompt,
        mode,
        provider,
        version,
        apiKey: currentKey.value,
        userId: userId,
      });
    },
    [optimize, mode, provider, version, currentKey.value, userId],
  );

  const deferredOptimized = useDeferredValue(optimizedText);
  const deferredExplanation = useDeferredValue(explanation);
  const deferredChanges = useDeferredValue(changes);

  const displayOptimized =
    isLoading || optimizedText.trim() ? (isLoading ? optimizedText : deferredOptimized) : '';
  const displayExplanation =
    isLoading || explanation.trim() ? (isLoading ? explanation : deferredExplanation) : '';
  const displayChanges = isLoading || changes.trim() ? (isLoading ? changes : deferredChanges) : '';

  const resetWorkspaceForNewRun = useCallback(
    (options?: { hideEmptyShell?: boolean }) => {
      setPromptLoad({ text: '', key: Date.now() });
      setTunedOriginal('');
      setInitialQAMessages([]);
      reset();
      if (options?.hideEmptyShell !== undefined) {
        setHideEmptyResultShell(options.hideEmptyShell);
      }
    },
    [reset],
  );

  const clearModeWorkspaces = useCallback(() => {
    modeWorkspacesRef.current = {};
  }, []);

  const captureModeWorkspace = useCallback((): ModeWorkspaceSnapshot => {
    return {
      promptLoad,
      tunedOriginal,
      initialQAMessages,
      hideEmptyResultShell,
      provider,
      optimizedText,
      explanation,
      changes,
      sessionId,
      usedProvider: usedProvider ?? provider,
      usedModel: usedModel ?? '',
    };
  }, [
    promptLoad,
    tunedOriginal,
    initialQAMessages,
    hideEmptyResultShell,
    provider,
    optimizedText,
    explanation,
    changes,
    sessionId,
    usedProvider,
    usedModel,
  ]);

  const restoreModeWorkspace = useCallback(
    (snapshot: ModeWorkspaceSnapshot) => {
      setHideEmptyResultShell(snapshot.hideEmptyResultShell);
      setProvider(snapshot.provider);
      setPromptLoad(snapshot.promptLoad ?? { text: '', key: Date.now() });
      setTunedOriginal(snapshot.tunedOriginal);
      setInitialQAMessages(snapshot.initialQAMessages);
      if (snapshot.optimizedText.trim() || snapshot.sessionId.trim()) {
        loadSession({
          optimizedText: snapshot.optimizedText,
          explanation: snapshot.explanation,
          changes: snapshot.changes,
          sessionId: snapshot.sessionId,
          provider: (String(snapshot.usedProvider || snapshot.provider).trim() || 'google') as ProviderId,
          model: snapshot.usedModel,
        });
      } else {
        reset();
      }
    },
    [loadSession, reset],
  );

  const handleModeChange = useCallback(
    (next: Mode) => {
      if (next === mode) return;

      const currentSnapshot = captureModeWorkspace();
      if (workspaceHasContent(currentSnapshot)) {
        modeWorkspacesRef.current[mode] = currentSnapshot;
      }

      setMode(next);

      const cached = modeWorkspacesRef.current[next];
      if (cached && workspaceHasContent(cached)) {
        restoreModeWorkspace(cached);
      } else {
        const carriedPrompt = promptTextFromSnapshot(currentSnapshot);
        if (carriedPrompt) {
          setHideEmptyResultShell(false);
          setPromptLoad({ text: carriedPrompt, key: Date.now() });
          setTunedOriginal('');
          setInitialQAMessages([]);
          reset();
        } else {
          resetWorkspaceForNewRun({ hideEmptyShell: false });
        }
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
    },
    [mode, captureModeWorkspace, restoreModeWorkspace, resetWorkspaceForNewRun],
  );

  const applyHistoryItem = useCallback(
    async (item: HistoryItem) => {
      clearModeWorkspaces();
      setHideEmptyResultShell(false);
      setPromptLoad({ text: item.original_prompt, key: Date.now() });
      setTunedOriginal(item.original_prompt);
      setMode(normalizeAppMode(item.mode));
      setProvider((item.provider?.trim() || 'google') as ProviderId);

      loadSession({
        optimizedText: item.optimized_prompt || '',
        explanation: item.explanation || '',
        changes: item.changes || '',
        sessionId: item.session_id,
        provider: item.provider as ProviderId,
        model: item.model || '',
      });

      try {
        const res = await fetch(`/api/qa-history?session_id=${item.session_id}`);
        if (res.ok) {
          const data = await res.json();
          setInitialQAMessages(data.messages || []);
        } else {
          setInitialQAMessages([]);
        }
      } catch (e) {
        console.error('Failed to fetch QA history', e);
        setInitialQAMessages([]);
      }
    },
    [clearModeWorkspaces, loadSession],
  );

  const startFreshOptimizer = useCallback(() => {
    clearModeWorkspaces();
    resetWorkspaceForNewRun({ hideEmptyShell: false });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [clearModeWorkspaces, resetWorkspaceForNewRun]);

  useEffect(() => {
    const picked = consumeHistoryPick();
    if (picked) {
      void applyHistoryItem(picked);
      return;
    }
    if (consumeNewOptimizerFlag()) {
      startFreshOptimizer();
      return;
    }

    const savedRaw = window.sessionStorage.getItem('pp_open_saved');
    if (!savedRaw) return;
    try {
      const saved = JSON.parse(savedRaw) as {
        original_prompt?: string;
        optimized_prompt?: string;
        explanation?: string;
        mode?: string;
        provider?: string;
      };
      clearModeWorkspaces();
      setHideEmptyResultShell(false);
      if (typeof saved.original_prompt === 'string') {
        setPromptLoad({ text: saved.original_prompt, key: Date.now() });
        setTunedOriginal(saved.original_prompt);
      }
      if (typeof saved.mode === 'string') {
        setMode(normalizeAppMode(saved.mode));
      }
      if (typeof saved.provider === 'string' && saved.provider.trim()) {
        setProvider(saved.provider.trim() as ProviderId);
      }
      if (typeof saved.optimized_prompt === 'string' && saved.optimized_prompt.trim()) {
        loadSession({
          optimizedText: saved.optimized_prompt,
          explanation: typeof saved.explanation === 'string' ? saved.explanation : '',
          changes: '',
          sessionId: '',
          provider: (saved.provider?.trim() || 'google') as ProviderId,
          model: '',
        });
      }
    } catch {
      // ignore
    } finally {
      window.sessionStorage.removeItem('pp_open_saved');
    }
  }, [applyHistoryItem, loadSession, startFreshOptimizer]);

  useEffect(() => {
    registerNewOptimizerHandler(startFreshOptimizer);
    return () => registerNewOptimizerHandler(null);
  }, [startFreshOptimizer]);

  useEffect(() => {
    const onSelect = (event: Event) => {
      const item = (event as CustomEvent<HistoryItem>).detail;
      if (item) void applyHistoryItem(item);
    };
    const onNew = () => startFreshOptimizer();
    window.addEventListener(RECENT_HISTORY_SELECT, onSelect);
    window.addEventListener(RECENT_NEW_OPTIMIZER, onNew);
    return () => {
      window.removeEventListener(RECENT_HISTORY_SELECT, onSelect);
      window.removeEventListener(RECENT_NEW_OPTIMIZER, onNew);
    };
  }, [applyHistoryItem, startFreshOptimizer]);

  const navProfile = useMemo(
    () => ({
      userId,
      userEmail: authEmail,
      username,
      avatarUrl,
    }),
    [userId, authEmail, username, avatarUrl],
  );

  return (
    <MindTuneShell>
      <AppBar active="optimizer" profile={navProfile} />
      <div className="optimizer-page landing-content-wide w-full py-8 md:py-10">
          <div className="optimizer-page-glow" aria-hidden />
          <div className="relative">
          <PromptPerfectHeader />

        <OptimizerComposer
          isLoading={isLoading}
          mode={mode}
          onModeChange={handleModeChange}
          version={version}
          onVersionChange={(v) => {
            setVersion(v);
            reset();
          }}
          provider={provider}
          onProviderChange={setProvider}
          usedProvider={usedProvider}
          usedModel={usedModel}
          promptLoad={promptLoad}
          error={error}
          shouldShowKeyHint={shouldShowKeyHint}
          onTune={runTune}
          onReset={() => {
            setHideEmptyResultShell(false);
            setInitialQAMessages([]);
            setTunedOriginal('');
            reset();
          }}
        />

        <div className="mt-7">
          <PromptPerfectOutputs
            optimizedText={displayOptimized}
            explanation={displayExplanation}
            changes={displayChanges}
            sessionId={sessionId}
            mode={mode}
            isLoading={isLoading}
            provider={provider}
            apiKey={currentKey.value}
            originalText={tunedOriginal}
            userId={userId}
            usedProvider={usedProvider}
            initialQAMessages={initialQAMessages}
            hideEmptyShell={hideEmptyResultShell}
          />
        </div>
          </div>
      </div>
    </MindTuneShell>
  );
}

export function PromptPerfectApp() {
  const [session, setSession] = useState<AppAuthSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(() => {
    if (typeof window === 'undefined') return 'login';
    return new URLSearchParams(window.location.search).get('auth') === 'signup' ? 'signup' : 'login';
  });
  const [forceAuth, setForceAuth] = useState(() => {
    if (typeof window === 'undefined') return false;
    const auth = new URLSearchParams(window.location.search).get('auth');
    return auth === '1' || auth === 'login' || auth === 'signup';
  });

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      void Promise.resolve().then(() => setLoadingSession(false));
      return;
    }

    void (async () => {
      const { session, error } = await getClientSession(supabase);
      if (error && isAuthNetworkError(error)) {
        await clearLocalAuthSession(supabase);
        setSession(null);
      } else {
        setSession(session);
      }
      setLoadingSession(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setLoadingSession(false);

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      } else if (!session) {
        setIsPasswordRecovery(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
      setSession(null);
    }
  };

  if (loadingSession) {
    return (
      <MindTuneShell>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-sky-400" />
        </div>
      </MindTuneShell>
    );
  }

  if (isPasswordRecovery) {
    return <UpdatePassword onComplete={() => setIsPasswordRecovery(false)} />;
  }

  // Show landing page for logged-out users who haven't clicked Get Started yet
  if (!session && showLanding && !forceAuth) {
    return (
      <LandingPage
        onLogin={() => {
          setAuthMode('login');
          setShowLanding(false);
          setForceAuth(true);
        }}
        onSignUp={() => {
          setAuthMode('signup');
          setShowLanding(false);
          setForceAuth(true);
        }}
      />
    );
  }

  if (!session || forceAuth) {
    return (
      <Auth
        initialMode={authMode}
        onLogin={() => setForceAuth(false)}
        onLogoClick={() => {
          setShowLanding(true);
          setForceAuth(false);
          const url = new URL(window.location.href);
          url.searchParams.delete('auth');
          window.history.replaceState(null, '', `${url.pathname}${url.search}`);
        }}
      />
    );
  }

  return <PromptPerfectMain session={session} onLogout={handleLogout} />;
}
