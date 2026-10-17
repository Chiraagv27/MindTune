import type { Metadata } from 'next';

import { PromptPerfectApp } from '@/components/PromptPerfectApp';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Optimizer',
  description: 'Tune prompts with Developer, Beginner, or Step-by-step modes. Voice input, streaming results, library, and share links.',
  path: '/',
});

export default function Home() {
  return <PromptPerfectApp />;
}
