import type { Metadata } from 'next';

import { DEFAULT_DESCRIPTION, getSiteUrl, SITE_NAME, SITE_TAGLINE } from '@/lib/site';

const siteUrl = getSiteUrl();

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function pageMetadata(input: {
  title: string;
  description?: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const description = input.description ?? DEFAULT_DESCRIPTION;
  const canonical = input.path.startsWith('/') ? input.path : `/${input.path}`;

  return {
    title: input.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${input.title} · ${SITE_NAME}`,
      description,
      url: `${siteUrl}${canonical}`,
    },
    twitter: {
      title: `${input.title} · ${SITE_NAME}`,
      description,
    },
    robots: input.noIndex ? { index: false, follow: false } : undefined,
  };
}
