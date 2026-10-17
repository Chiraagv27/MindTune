'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { MindTuneShell } from '@/components/MindTuneShell';
import { SiteFooter } from '@/components/SiteFooter';

export function LegalDocumentLayout({
  title,
  updated,
  breadcrumbs,
  children,
}: {
  title: string;
  updated: string;
  breadcrumbs?: { name: string; href: string }[];
  children: React.ReactNode;
}) {
  return (
    <MindTuneShell>
      <header className="border-b border-zinc-800/90">
        <div className="landing-content flex items-center py-4">
          <Link href="/welcome" className="text-sm font-semibold text-zinc-100">
            MindTune
          </Link>
        </div>
      </header>
      <main className="landing-content max-w-3xl py-10">
        {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
        <h1 className="text-2xl font-semibold text-zinc-50">{title}</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: {updated}</p>
        <div className="prose prose-invert prose-zinc mt-8 max-w-none text-sm">{children}</div>
      </main>
      <SiteFooter className="border-zinc-800 bg-transparent text-zinc-500 [&_a:hover]:text-zinc-200" />
    </MindTuneShell>
  );
}
