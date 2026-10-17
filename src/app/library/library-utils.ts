import type { LucideIcon } from 'lucide-react';
import { BookOpen, Cpu, FolderOpen, Globe, Layers, Sparkles } from 'lucide-react';

import { estimateTokenCount, formatRelativeTime, modeDisplayLabel, normalizeAppMode } from '@/lib/modeStyles';
import type { Mode } from '@/lib/types';

export interface SavedPrompt {
  id: string;
  title: string;
  collection: string;
  original_prompt: string;
  optimized_prompt: string;
  explanation: string;
  mode: string;
  provider: string;
  created_at: string;
}

export const FILTER_MODES: Array<{ value: Mode; label: string }> = [
  { value: 'developer', label: 'Developer' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'step-by-step', label: 'Step-by-step' },
];

const APP_MODES: Mode[] = ['developer', 'beginner', 'step-by-step'];

const COLLECTION_ICONS: LucideIcon[] = [Globe, Cpu, BookOpen, Layers, Sparkles, FolderOpen];

export function toAppMode(mode: string): Mode {
  const normalized = normalizeAppMode(mode);
  if ((APP_MODES as string[]).includes(normalized)) return normalized;
  return 'developer';
}

export function modeLabel(mode: string) {
  return FILTER_MODES.find((item) => item.value === toAppMode(mode))?.label ?? modeDisplayLabel(mode);
}

export function modeCardPillClass(mode: string) {
  const m = toAppMode(mode);
  if (m === 'developer') return 'bg-violet-500/15 text-violet-200 ring-1 ring-violet-500/30';
  if (m === 'beginner') return 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/28';
  return 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/28';
}

export function collectionIcon(name: string): LucideIcon {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash + name.charCodeAt(i) * (i + 1)) % COLLECTION_ICONS.length;
  return COLLECTION_ICONS[hash] ?? FolderOpen;
}

export function collectionDescription(name: string, items: SavedPrompt[]) {
  const modes = [...new Set(items.map((p) => modeLabel(p.mode)))];
  const modeText = modes.length <= 2 ? modes.join(' and ') : `${modes.slice(0, 2).join(', ')}, and more`;
  return `Tuned presets for ${name}. Mostly ${modeText} prompts you can copy or re-run in the optimizer.`;
}

export function promptCardTitle(prompt: SavedPrompt, collectionName: string) {
  const title = prompt.title.trim();
  const repeatsCollection = title.toLowerCase() === collectionName.trim().toLowerCase();
  if (title && !repeatsCollection) return title;
  const oneLine = prompt.original_prompt.replace(/\s+/g, ' ').trim();
  if (oneLine.length <= 64) return oneLine;
  return `${oneLine.slice(0, 63).trim()}…`;
}

export function promptSnippet(text: string, max = 120) {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max - 1).trim()}…`;
}

export function promptTokens(prompt: SavedPrompt) {
  return estimateTokenCount(prompt.optimized_prompt || prompt.original_prompt);
}

export function promptUpdatedLabel(iso: string) {
  const rel = formatRelativeTime(iso);
  if (rel === 'Just now') return 'Updated just now';
  if (rel.endsWith('ago')) return `Updated ${rel.replace(' ago', '')} ago`;
  return `Updated ${rel}`;
}

export function libraryStats(all: SavedPrompt[]) {
  const collections = new Set(all.map((p) => p.collection?.trim() || 'Ungrouped'));
  return {
    collectionCount: collections.size,
    promptCount: all.length,
  };
}

export function groupByCollection(items: SavedPrompt[]) {
  const groups = new Map<string, SavedPrompt[]>();
  for (const prompt of items) {
    const name = prompt.collection?.trim() || 'Ungrouped';
    const list = groups.get(name) ?? [];
    list.push(prompt);
    groups.set(name, list);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function openSavedInWorkspace(prompt: SavedPrompt) {
  window.sessionStorage.setItem(
    'pp_open_saved',
    JSON.stringify({
      original_prompt: prompt.original_prompt,
      optimized_prompt: prompt.optimized_prompt,
      explanation: prompt.explanation ?? '',
      mode: toAppMode(prompt.mode),
      provider: prompt.provider?.trim() || 'google',
      collection: prompt.collection?.trim() || '',
    }),
  );
}

export function stashReoptimize(prompt: SavedPrompt) {
  window.sessionStorage.setItem(
    'pp_reoptimize',
    JSON.stringify({
      text: prompt.original_prompt,
      mode: toAppMode(prompt.mode),
    }),
  );
}
