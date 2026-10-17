import type { SupabaseClient } from '@supabase/supabase-js';

type AuthSession = NonNullable<Awaited<ReturnType<SupabaseClient['auth']['getSession']>>['data']['session']>;
type AuthUser = NonNullable<AuthSession['user']>;

export function isAuthNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const message =
    'message' in error && typeof (error as { message: unknown }).message === 'string'
      ? (error as { message: string }).message
      : '';
  return message === 'Failed to fetch' || message.toLowerCase().includes('network');
}

/** Prefer getSession over getUser() to avoid extra Auth API round-trips when possible. */
export async function getClientSession(supabase: SupabaseClient): Promise<{
  session: AuthSession | null;
  error: unknown;
}> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return { session: null, error };
    return { session: data.session, error: null };
  } catch (err) {
    return { session: null, error: err };
  }
}

export async function getSessionUser(supabase: SupabaseClient): Promise<{
  user: AuthUser | null;
  error: unknown;
}> {
  const { session, error } = await getClientSession(supabase);
  return { user: session?.user ?? null, error };
}

/** Drop cached tokens without a network sign-out (offline-safe). */
export async function clearLocalAuthSession(supabase: SupabaseClient): Promise<void> {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    // ignore
  }
}
