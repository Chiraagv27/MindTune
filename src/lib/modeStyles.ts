import type { Mode } from '@/lib/types';

const MODE_PILLS: Record<Mode, string> = {
  developer: 'bg-violet-500/10 text-violet-700 border-violet-500/25 dark:text-violet-300',
  beginner: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-300',
  'step-by-step': 'bg-amber-500/10 text-amber-800 border-amber-500/25 dark:text-amber-300',
};

/** Optimizer mode pills (active + hover per mode). */
export const MODE_SEGMENT_UI: Record<Mode, { active: string; hover: string }> = {
  developer: {
    active:
      'bg-violet-500/22 text-violet-100 ring-1 ring-violet-500/50 shadow-sm shadow-violet-950/30',
    hover: 'hover:bg-violet-500/12 hover:text-violet-200',
  },
  beginner: {
    active:
      'bg-emerald-500/22 text-emerald-100 ring-1 ring-emerald-500/50 shadow-sm shadow-emerald-950/30',
    hover: 'hover:bg-emerald-500/12 hover:text-emerald-200',
  },
  'step-by-step': {
    active:
      'bg-amber-500/22 text-amber-100 ring-1 ring-amber-500/50 shadow-sm shadow-amber-950/30',
    hover: 'hover:bg-amber-500/12 hover:text-amber-200',
  },
};

const MODE_SCORE_TEXT: Record<Mode, string> = {
  developer: 'text-violet-400 dark:text-violet-300',
  beginner: 'text-emerald-400 dark:text-emerald-300',
  'step-by-step': 'text-amber-400 dark:text-amber-300',
};

export function modeSegmentUi(mode: string): { active: string; hover: string } {
  const key = normalizeAppMode(mode);
  return MODE_SEGMENT_UI[key];
}

const MODE_LABELS: Record<Mode, string> = {
  developer: 'Developer',
  beginner: 'Beginner',
  'step-by-step': 'Step-by-step',
};

/** Map stored / legacy mode strings to one of the three active modes. */
export function normalizeAppMode(mode: string | null | undefined): Mode {
  const key = (mode ?? '').trim().toLowerCase();
  if (key === 'beginner') return 'beginner';
  if (key === 'step-by-step' || key === 'cot') return 'step-by-step';
  return 'developer';
}

export function modePillClass(mode: string) {
  const key = normalizeAppMode(mode);
  return (
    MODE_PILLS[key] ??
    'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
  );
}

export type ModeDrawerTone = Mode;

/** Landing-aligned drawer chip + score tones (zinc / sky system). */
export function modeDrawerTone(mode: string): ModeDrawerTone {
  return normalizeAppMode(mode);
}

export function modeScoreTextClass(mode: string) {
  const key = normalizeAppMode(mode);
  return MODE_SCORE_TEXT[key] ?? 'text-violet-600 dark:text-[#d2bbff]';
}

export function modeDisplayLabel(mode: string) {
  return MODE_LABELS[normalizeAppMode(mode)];
}

export function formatRelativeTime(iso: string) {
  return formatHistoryWhen(iso).label;
}

export function formatHistoryWhen(iso: string): { label: string; recent: boolean } {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { label: 'Unknown', recent: false };
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return { label: 'Just now', recent: true };
  if (mins < 60) {
    return { label: mins === 1 ? '1 minute ago' : `${mins} minutes ago`, recent: false };
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return { label: hours === 1 ? '1 hour ago' : `${hours} hours ago`, recent: false };
  }
  const days = Math.floor(hours / 24);
  if (days === 1) return { label: 'Yesterday', recent: false };
  if (days < 7) return { label: `${days} days ago`, recent: false };
  return {
    label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    recent: false,
  };
}

/** Rough token estimate for drawer metrics (chars / 4). */
export function estimateTokenCount(text: string) {
  const t = text.trim();
  if (!t) return 0;
  return Math.max(1, Math.ceil(t.length / 4));
}

export function historyCardTitle(prompt: string, maxLen = 72) {
  const oneLine = prompt.replace(/\s+/g, ' ').trim();
  if (oneLine.length <= maxLen) return oneLine;
  return `${oneLine.slice(0, maxLen - 1).trim()}…`;
}
