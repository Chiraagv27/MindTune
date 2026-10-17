import Link from 'next/link';

import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  if (items.length === 0) return null;

  return (
    <>
      <BreadcrumbJsonLd items={items} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-zinc-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.href} className="inline-flex items-center gap-1.5">
                {index > 0 ? <span aria-hidden className="text-zinc-600">/</span> : null}
                {isLast ? (
                  <span className="text-zinc-400" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.href} className="text-zinc-400 transition hover:text-zinc-200">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
