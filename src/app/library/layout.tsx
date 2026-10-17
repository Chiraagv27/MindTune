import type { Metadata } from 'next';

import { pageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Library',
  description: 'Your saved MindTune prompts and collections.',
  path: '/library',
  noIndex: true,
});

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
