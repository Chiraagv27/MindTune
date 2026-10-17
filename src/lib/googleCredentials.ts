import type { AppAuthSession } from '@/lib/types';

/** Google signups must choose a username and password before they can use the app. */
export function needsGoogleCredentialSetup(user: AppAuthSession['user']): boolean {
  if (user.user_metadata?.credentials_ready === true) return false;
  const providers = user.app_metadata?.providers ?? [];
  const usesGoogle = user.app_metadata?.provider === 'google' || providers.includes('google');
  if (!usesGoogle) return false;
  if (providers.includes('email')) return false;
  return true;
}
