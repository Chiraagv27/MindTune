import type { HistoryItem } from '@/components/HistoryPanel';

export const RECENT_DRAWER_OPEN = 'mindtune:open-recent';
export const RECENT_DRAWER_OPEN_CHANGE = 'mindtune:recent-open-change';
export const RECENT_HISTORY_SELECT = 'mindtune:history-select';
export const RECENT_NEW_OPTIMIZER = 'mindtune:new-optimizer-prompt';

const PICK_KEY = 'pp_history_pick';
const LEGACY_OPEN_KEY = 'pp_open_recent';
const NEW_OPTIMIZER_KEY = 'pp_new_optimizer';

let newOptimizerHandler: (() => void) | null = null;

/** Optimizer page registers so Recent "+" clears workspace without remounting. */
export function registerNewOptimizerHandler(handler: (() => void) | null) {
  newOptimizerHandler = handler;
}

export function openRecentDrawer() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(RECENT_DRAWER_OPEN));
}

export function emitRecentDrawerOpenChange(open: boolean) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(RECENT_DRAWER_OPEN_CHANGE, { detail: { open } }));
}

export function stashHistoryPick(item: HistoryItem) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(PICK_KEY, JSON.stringify(item));
}

export function consumeHistoryPick(): HistoryItem | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(PICK_KEY);
  if (!raw) return null;
  window.sessionStorage.removeItem(PICK_KEY);
  try {
    return JSON.parse(raw) as HistoryItem;
  } catch {
    return null;
  }
}

export function consumeLegacyOpenRecentFlag(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.sessionStorage.getItem(LEGACY_OPEN_KEY) !== '1') return false;
  window.sessionStorage.removeItem(LEGACY_OPEN_KEY);
  return true;
}

/** Blank optimizer workspace (Recent drawer +). */
export function requestNewOptimizerPrompt() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem('pp_open_saved');
  window.sessionStorage.removeItem('pp_reoptimize');
  window.sessionStorage.setItem(NEW_OPTIMIZER_KEY, '1');
  newOptimizerHandler?.();
  window.dispatchEvent(new CustomEvent(RECENT_NEW_OPTIMIZER));
}

export function consumeNewOptimizerFlag(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.sessionStorage.getItem(NEW_OPTIMIZER_KEY) !== '1') return false;
  window.sessionStorage.removeItem(NEW_OPTIMIZER_KEY);
  return true;
}
