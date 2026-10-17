import { processLock } from '@supabase/auth-js';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;
let adminCached: SupabaseClient | null = null;

/** Turbopack can fail to inline NEXT_PUBLIC_* when using optional chaining on the value; use explicit string checks. */
function publicSupabaseUrl(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return typeof v === 'string' ? v.trim().replace(/\/+$/, '') : '';
}

function publicSupabaseAnonKey(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return typeof v === 'string' ? v.trim() : '';
}

function serviceRoleKey(): string {
  const v = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return typeof v === 'string' ? v.trim() : '';
}

export function getSupabaseClient(): SupabaseClient | null {
  if (cached) return cached;

  const url = publicSupabaseUrl();
  const anonKey = publicSupabaseAnonKey();

  if (!url || !anonKey) {
    console.warn('Supabase credentials missing');
    return null;
  }

  // Navigator LockManager can time out when many components call auth at once (or a stale tab holds the lock).
  // processLock serializes auth work in this tab without cross-tab locks.
  cached = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      lock: processLock,
    },
    global: {
      fetch: async (input, init) => {
        try {
          return await fetch(input, init);
        } catch (err) {
          const target = typeof input === 'string' ? input : input instanceof Request ? input.url : '';
          if (target.includes('/auth/v1/')) {
            console.warn(
              '[MindTune] Could not reach Supabase Auth. Check your connection or that the project is active.',
            );
          }
          throw err;
        }
      },
    },
  });
  return cached;
}

function authParam(name: string): string | null {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return search.get(name) || hash.get(name);
}

/** Finish a Google (or other) OAuth redirect. The PKCE verifier lives in browser storage, so this must run on the client. */
export async function completeOAuthRedirect(): Promise<{ error: string | null }> {
  const url = publicSupabaseUrl();
  const anonKey = publicSupabaseAnonKey();
  if (!url || !anonKey) return { error: 'Supabase credentials missing' };
  if (typeof window === 'undefined') return { error: 'OAuth can only be completed in the browser' };

  const client = createClient(url, anonKey, {
    auth: { detectSessionInUrl: false, persistSession: true, flowType: 'pkce' },
  });

  const oauthError = authParam('error_description') || authParam('error');
  if (oauthError) return { error: oauthError };

  const code = authParam('code');
  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) {
      const { data } = await client.auth.getSession();
      if (!data.session) return { error: error.message };
    }
    return rejectOAuthLoginIfAccountWasJustCreated(client);
  }

  const accessToken = authParam('access_token');
  const refreshToken = authParam('refresh_token');
  if (accessToken && refreshToken) {
    const { error } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) return { error: error.message };
    return rejectOAuthLoginIfAccountWasJustCreated(client);
  }

  const { data } = await client.auth.getSession();
  if (!data.session) return { error: 'Missing sign-in code. Try Continue with Google again.' };

  return rejectOAuthLoginIfAccountWasJustCreated(client);
}

/**
 * Google shows "continue to [host]" for the OAuth callback domain (Supabase URL by default).
 * Use a Supabase Auth custom domain plus Google OAuth branding "MindTune" (see README section 5).
 */
export async function signInWithGoogle(intent: 'login' | 'signup'): Promise<{ error: string | null }> {
  const client = getSupabaseClient();
  if (!client) return { error: 'Supabase client not initialized' };
  if (typeof window === 'undefined') return { error: 'Google sign-in must run in the browser' };

  window.sessionStorage.setItem('mindtune_auth_intent', intent);
  const redirectTo = `${window.location.origin}/auth/callback`;
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  return { error: error?.message ?? null };
}

/** Login must not create an account. Signup is the only path that should. */
async function rejectOAuthLoginIfAccountWasJustCreated(client: SupabaseClient): Promise<{ error: string | null }> {
  const intent = window.sessionStorage.getItem('mindtune_auth_intent');
  window.sessionStorage.removeItem('mindtune_auth_intent');
  if (intent !== 'login') return { error: null };

  const { data: sessionData } = await client.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) return { error: null };

  const response = await fetch('/api/auth/require-signup', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => null) as { rejected?: boolean } | null;
  if (!body?.rejected) return { error: null };

  await client.auth.signOut();
  return { error: 'SIGNUP_REQUIRED' };
}

/** Server-only: uses service role key, bypasses RLS. Use for trusted server operations. */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (adminCached) return adminCached;

  const url = publicSupabaseUrl();
  const key = serviceRoleKey();
  if (!url || !key) return null;

  adminCached = createClient(url, key);
  return adminCached;
}

