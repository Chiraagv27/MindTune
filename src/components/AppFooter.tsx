'use client';

export function AppFooter() {
  return (
    <footer className="mt-16 border-t border-zinc-200/70 py-6 text-xs text-zinc-500 dark:border-zinc-800/80">
      <div className="landing-content-wide flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p>MindTune Algorithmic Engine © 2024 · v2.4.0-stable</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <a href="#" className="hover:text-violet-600 dark:hover:text-violet-300">
            Documentation
          </a>
          <a href="#" className="hover:text-violet-600 dark:hover:text-violet-300">
            Token Metrics
          </a>
          <a href="#" className="hover:text-violet-600 dark:hover:text-violet-300">
            Privacy &amp; Security
          </a>
        </nav>
      </div>
    </footer>
  );
}
