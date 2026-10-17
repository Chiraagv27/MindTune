/** Public site URL for SEO (set in production). Falls back to localhost in dev. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '');
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export const SITE_NAME = 'MindTune';
export const SITE_TAGLINE = 'Speak messy. Get precision.';
export const DEFAULT_DESCRIPTION =
  'MindTune turns rough ideas—typed or spoken—into clear, reusable prompts with explanations and a personal library.';
