import Link from 'next/link';

export function SiteFooter({
  className = '',
  containerClassName = '',
}: {
  className?: string;
  containerClassName?: string;
}) {
  const year = new Date().getFullYear();
  return (
    <footer className={`border-t border-zinc-200 py-8 dark:border-zinc-800 ${className}`}>
      <div
        className={`mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-zinc-500 md:flex-row ${containerClassName}`}
      >
        <p>MindTune {year}</p>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:justify-end">
          <Link href="/welcome" className="hover:text-zinc-900 dark:hover:text-zinc-200">
            About MindTune
          </Link>
          <Link href="/welcome#how-it-works" className="hover:text-zinc-900 dark:hover:text-zinc-200">
            How it works
          </Link>
          <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-200">
            Privacy policy
          </Link>
          <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-200">
            Terms and conditions
          </Link>
        </nav>
      </div>
    </footer>
  );
}
