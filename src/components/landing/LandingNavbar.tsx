'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { memo, useState } from 'react';
import { useNavbarAutoHide } from '@/hooks/useNavbarAutoHide';
import { landingSectionNavClick } from '@/lib/landingScroll';

export const LANDING_NAV = [
  { id: 'hero', label: 'Overview', href: '#hero' },
  { id: 'how-it-works', label: 'How it works', href: '#how-it-works' },
  { id: 'workspace', label: 'Workspace', href: '#workspace' },
  { id: 'save', label: 'Save & share', href: '#save' },
  { id: 'example', label: 'Example', href: '#example' },
] as const;

interface LandingNavbarProps {
  onLogin: () => void;
  onSignUp: () => void;
  activeId: string;
}

function LandingNavbarInner({ onLogin, onSignUp, activeId }: LandingNavbarProps) {
  const [open, setOpen] = useState(false);
  const navVisible = useNavbarAutoHide(open);

  const close = () => setOpen(false);

  return (
    <div
      className={`landing-navbar-shell pointer-events-none fixed inset-x-0 top-0 z-50 pt-3 md:pt-4 ${
        navVisible ? '' : 'landing-navbar-shell-hidden'
      }`}
    >
      <div className="landing-content-full mx-auto w-full">
        <div className="landing-navbar-progress pointer-events-none mb-2.5" aria-hidden>
          <div
            id="landing-scroll-progress"
            className="h-full w-full origin-left rounded-full bg-gradient-to-r from-sky-500 to-sky-300 will-change-transform"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>

        <header className="landing-navbar-bar pointer-events-auto w-full">
        <div className="flex h-[3.25rem] items-center gap-3 px-3 md:px-5">
          <Link href="/welcome" className="shrink-0 text-lg font-semibold tracking-tight text-white">
            MindTune
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto lg:flex" aria-label="Landing sections">
            {LANDING_NAV.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => landingSectionNavClick(e, item.id)}
                className={`group relative shrink-0 px-2.5 py-2 text-[11px] font-medium uppercase tracking-wide transition md:text-xs ${
                  activeId === item.id ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-2 bottom-0 h-px origin-left bg-sky-400 transition-transform duration-300 ${
                    activeId === item.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100 group-hover:bg-zinc-600'
                  }`}
                  aria-hidden
                />
              </a>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <button
              type="button"
              onClick={onLogin}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={onSignUp}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Sign up
            </button>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="rounded-lg border border-zinc-700 p-2 text-zinc-200"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open ? (
          <div className="max-h-[min(70vh,420px)] overflow-y-auto border-t border-zinc-800 px-3 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {LANDING_NAV.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    landingSectionNavClick(e, item.id);
                    close();
                  }}
                  className={`rounded-lg px-3 py-2.5 text-sm ${
                    activeId === item.id ? 'bg-sky-500/15 text-sky-300' : 'text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-2 border-t border-zinc-800 pt-3">
              <button type="button" onClick={() => { onLogin(); close(); }} className="rounded-lg px-3 py-2 text-left text-sm text-zinc-200 hover:bg-white/5">
                Log in
              </button>
              <button
                type="button"
                onClick={() => {
                  onSignUp();
                  close();
                }}
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-zinc-950"
              >
                Sign up
              </button>
            </div>
          </div>
        ) : null}
        </header>
      </div>
    </div>
  );
}

export const LandingNavbar = memo(LandingNavbarInner);
