import type { Metadata } from 'next';

import { pageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Settings',
  description: 'Manage your MindTune profile, API keys, and account.',
  path: '/settings',
  noIndex: true,
});

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
