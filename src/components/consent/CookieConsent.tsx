'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { readCookieConsent, writeCookieConsent } from '@/lib/analytics';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    if (!readCookieConsent()) setVisible(true);
  }, []);

  if (!visible) return null;

  const save = (allowAnalytics: boolean) => {
    writeCookieConsent(allowAnalytics);
    setVisible(false);
    setShowPrefs(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] p-4 md:p-6">
      <div className="landing-content-full mx-auto max-w-3xl rounded-2xl border border-zinc-700/80 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur-md">
        {!showPrefs ? (
          <>
            <p className="text-sm leading-relaxed text-zinc-300">
              We use essential storage for sign-in and your preferences. Optional analytics help us improve MindTune
              only if you allow it. See our{' '}
              <Link href="/privacy" className="font-medium text-sky-400 hover:text-sky-300">
                Privacy policy
              </Link>
              .
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="landing-btn-primary !py-2 !px-4 text-sm" onClick={() => save(false)}>
                Accept essential only
              </button>
              <button type="button" className="landing-btn-secondary !py-2 !px-4 text-sm" onClick={() => save(true)}>
                Accept all
              </button>
              <button
                type="button"
                className="landing-btn-ghost !py-2 text-sm"
                onClick={() => {
                  setShowPrefs(true);
                  setAnalytics(false);
                }}
              >
                Preferences
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-zinc-100">Cookie preferences</p>
            <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-zinc-300">
              <input type="checkbox" checked disabled className="mt-1" />
              <span>
                <span className="font-medium text-zinc-100">Essential</span> — required for auth and app features
                (always on).
              </span>
            </label>
            <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-zinc-100">Analytics</span> — anonymous usage events when you configure
                an analytics ID.
              </span>
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="landing-btn-primary !py-2 !px-4 text-sm" onClick={() => save(analytics)}>
                Save preferences
              </button>
              <button
                type="button"
                className="landing-btn-ghost !py-2 text-sm"
                onClick={() => setShowPrefs(false)}
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
