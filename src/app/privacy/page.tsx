import type { Metadata } from 'next';

import { LegalDocumentLayout } from '@/components/LegalDocumentLayout';
import { PrivacyPolicyContent } from '@/content/PrivacyPolicyContent';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy policy',
  description: 'How MindTune handles prompts, account data, API providers, and your privacy choices.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <LegalDocumentLayout
      title="Privacy policy"
      updated="17 October 2026"
      breadcrumbs={[
        { name: 'Home', href: '/welcome' },
        { name: 'Privacy policy', href: '/privacy' },
      ]}
    >
      <PrivacyPolicyContent />
    </LegalDocumentLayout>
  );
}
