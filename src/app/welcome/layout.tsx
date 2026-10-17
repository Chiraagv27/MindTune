import type { Metadata } from 'next';

import { pageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Welcome',
  description:
    'MindTune turns rough ideas into sharp prompts. See how voice input, three tuning modes, library, and share links work.',
  path: '/welcome',
});

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
