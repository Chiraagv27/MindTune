import type { Metadata } from 'next';

import { LegalDocumentLayout } from '@/components/LegalDocumentLayout';
import { TermsAndConditionsContent } from '@/content/TermsAndConditionsContent';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Terms and conditions',
  description: 'Terms of use for MindTune prompt optimization, accounts, and shared links.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <LegalDocumentLayout
      title="Terms and conditions"
      updated="17 October 2026"
      breadcrumbs={[
        { name: 'Home', href: '/welcome' },
        { name: 'Terms and conditions', href: '/terms' },
      ]}
    >
      <TermsAndConditionsContent />
    </LegalDocumentLayout>
  );
}
