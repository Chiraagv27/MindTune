'use client';

import { useRouter } from 'next/navigation';
import { LandingPage } from '@/components/LandingPage';
import { trackEvent } from '@/lib/analytics';

export default function WelcomePage() {
  const router = useRouter();
  return (
    <LandingPage
      onLogin={() => {
        trackEvent('login_started', { source: 'welcome' });
        router.push('/?auth=login');
      }}
      onSignUp={() => {
        trackEvent('sign_up_started', { source: 'welcome' });
        router.push('/?auth=signup');
      }}
    />
  );
}
