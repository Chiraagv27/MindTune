/** Analytics runs only after cookie consent and when you configure an ID (no SDK bundled). */

const CONSENT_KEY = 'mindtune:cookie-consent';
const ANALYTICS_KEY = 'mindtune:analytics-enabled';

export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  updatedAt: string;
};

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieConsent;
  } catch {
    return null;
  }
}

export function writeCookieConsent(analytics: boolean) {
  if (typeof window === 'undefined') return;
  const value: CookieConsent = {
    necessary: true,
    analytics,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
  localStorage.setItem(ANALYTICS_KEY, analytics ? '1' : '0');
  window.dispatchEvent(new CustomEvent('mindtune:consent-change', { detail: value }));
}

export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ANALYTICS_KEY) === '1';
}

/** Fire a conversion/event when analytics consent + NEXT_PUBLIC_ANALYTICS_ID are set. */
export function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;
  const id = process.env.NEXT_PUBLIC_ANALYTICS_ID?.trim();
  if (!id) return;

  const w = window as Window & { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };
  if (typeof w.gtag === 'function') {
    w.gtag('event', name, params ?? {});
    return;
  }
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event: name, ...params });
}
