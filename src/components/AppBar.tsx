'use client';



import { Clock } from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { openRecentDrawer, RECENT_DRAWER_OPEN_CHANGE } from '@/lib/recentDrawer';

import { ProfileMenu } from '@/components/ProfileMenu';

import { useNavProfile, type NavProfile } from '@/hooks/useNavProfile';
import { appBarIconBtn } from '@/lib/ui/classes';



type NavKey = 'optimizer' | 'library' | 'settings';



interface AppBarProps {

  active?: NavKey;

  profile?: NavProfile | null;

}



const navLinkClass = (active: boolean) =>

  `relative shrink-0 px-3 py-2 text-sm font-medium transition ${

    active ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'

  }`;



export function AppBar({ active, profile: profileOverride }: AppBarProps) {

  const router = useRouter();

  const loadedProfile = useNavProfile();

  const profile = profileOverride ?? loadedProfile;

  const [recentOpen, setRecentOpen] = useState(false);

  useEffect(() => {
    router.prefetch('/');
  }, [router]);

  useEffect(() => {
    const onChange = (event: Event) => {
      const open = (event as CustomEvent<{ open: boolean }>).detail?.open === true;
      setRecentOpen(open);
    };
    window.addEventListener(RECENT_DRAWER_OPEN_CHANGE, onChange);
    return () => window.removeEventListener(RECENT_DRAWER_OPEN_CHANGE, onChange);
  }, []);



  const goLanding = () => router.push('/welcome');

  const goOptimizer = () => router.push('/');

  const goLibrary = () => router.push('/library');

  const goSettings = () => router.push('/settings');

  const openHistory = () => {
    openRecentDrawer();
  };



  return (

    <header className="app-bar-sticky sticky top-0 z-30 border-b border-zinc-800/90 bg-zinc-950/94">

      <div className="landing-content-wide flex h-14 items-center justify-between gap-4">

        <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-6">

          <button

            type="button"

            onClick={goLanding}

            className="shrink-0 text-lg font-semibold tracking-tight text-zinc-50 hover:text-zinc-300"

          >

            MindTune

          </button>

          <nav

            className="flex min-w-0 items-center gap-0.5 overflow-x-auto border-l border-zinc-800 pl-4 md:pl-6"

            aria-label="Main"

          >

            {(

              [

                ['optimizer', 'Optimizer', goOptimizer],

                ['library', 'Library', goLibrary],

                ['settings', 'Settings', goSettings],

              ] as const

            ).map(([key, label, onClick]) => (

              <button key={key} type="button" onClick={onClick} className={`group relative ${navLinkClass(active === key)}`}>

                {label}

                <span

                  className={`absolute inset-x-2 bottom-0 h-px origin-left bg-sky-400 transition-transform duration-300 ${

                    active === key ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100 group-hover:bg-zinc-600'

                  }`}

                  aria-hidden

                />

              </button>

            ))}

          </nav>

        </div>

        <div className="flex shrink-0 items-center gap-2">

          <button

            type="button"

            onClick={openHistory}

            title="Recent prompts"

            aria-label="Recent prompts"

            aria-pressed={recentOpen}

            className={`${appBarIconBtn}${recentOpen ? ' border-sky-500/50 bg-zinc-800' : ''}`.trim()}

          >

            <Clock className="h-3.5 w-3.5" />

          </button>

          <ProfileMenu

            userId={profile?.userId}

            userEmail={profile?.userEmail}

            username={profile?.username}

            avatarUrl={profile?.avatarUrl}

          />

        </div>

      </div>

    </header>

  );

}

