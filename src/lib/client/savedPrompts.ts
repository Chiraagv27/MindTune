import { getSupabaseClient } from '@/lib/client/supabase';

interface SavePromptInput {
  userId: string;
  title: string;
  collection: string;
  originalPrompt: string;
  optimizedPrompt: string;
  explanation: string;
  mode: string;
  provider: string;
}

export async function listPromptCollections(userId: string): Promise<string[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('pp_saved_prompts')
    .select('collection')
    .eq('user_id', userId);

  if (error || !data) return [];

  const names = new Map<string, string>();
  for (const row of data) {
    const name = String(row.collection ?? '').trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (!names.has(key)) names.set(key, name);
  }

  return [...names.values()].sort((a, b) => a.localeCompare(b));
}

export function resolveCollectionName(name: string, existing: string[]) {
  const trimmed = name.trim();
  const match = existing.find((item) => item.toLowerCase() === trimmed.toLowerCase());
  return match ?? trimmed;
}

/** Align with history delete / drawer save (`provider ?? 'google'`). */
export function normalizeSavedProvider(provider: string | null | undefined): string {
  const trimmed = (provider ?? '').trim();
  return trimmed || 'google';
}

const LEGACY_MODE_ALIASES: Record<string, string> = {
  better: 'developer',
  specific: 'developer',
  cot: 'step-by-step',
};

export function normalizeSavedMode(mode: string | null | undefined): string {
  const trimmed = (mode ?? '').trim();
  if (!trimmed) return 'developer';
  return LEGACY_MODE_ALIASES[trimmed] ?? trimmed;
}

function modeLookupValues(mode: string): string[] {
  const normalized = normalizeSavedMode(mode);
  const values = new Set<string>([normalized]);
  for (const [legacy, mapped] of Object.entries(LEGACY_MODE_ALIASES)) {
    if (mapped === normalized) values.add(legacy);
  }
  return [...values];
}

function libraryMatchKey(original: string, optimized: string, mode: string, provider: string) {
  return [
    original,
    optimized,
    normalizeSavedMode(mode),
    normalizeSavedProvider(provider),
  ].join('\u0001');
}

/** Map optimization history row ids → library collection name when already saved. */
export async function findLibraryCollectionsForHistory(
  userId: string,
  items: Array<{
    id: string;
    original_prompt: string;
    optimized_prompt: string;
    mode: string;
    provider?: string;
  }>,
): Promise<Record<string, string>> {
  const supabase = getSupabaseClient();
  if (!supabase || items.length === 0) return {};

  const { data, error } = await supabase
    .from('pp_saved_prompts')
    .select('original_prompt, optimized_prompt, mode, provider, collection')
    .eq('user_id', userId);

  if (error || !data?.length) return {};

  const byStrictKey = new Map<string, string>();
  const byContentKey = new Map<string, string>();

  for (const row of data) {
    const collection = String(row.collection ?? '').trim();
    if (!collection) continue;
    const original = String(row.original_prompt ?? '');
    const optimized = String(row.optimized_prompt ?? '');
    const mode = String(row.mode ?? '');
    const provider = String(row.provider ?? '');
    byStrictKey.set(libraryMatchKey(original, optimized, mode, provider), collection);
    byContentKey.set(`${original}\u0001${optimized}`, collection);
  }

  const out: Record<string, string> = {};
  for (const item of items) {
    if (!item.optimized_prompt.trim()) continue;
    const strict = libraryMatchKey(
      item.original_prompt,
      item.optimized_prompt,
      item.mode,
      item.provider ?? 'google',
    );
    const loose = `${item.original_prompt}\u0001${item.optimized_prompt}`;
    const collection = byStrictKey.get(strict) ?? byContentKey.get(loose);
    if (collection) out[item.id] = collection;
  }

  return out;
}

export async function findSavedPromptForSession(input: {
  userId: string;
  originalPrompt: string;
  optimizedPrompt: string;
  mode: string;
  provider: string;
}): Promise<{ saved: boolean; collection: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase || !input.optimizedPrompt.trim()) {
    return { saved: false, collection: null };
  }

  const provider = normalizeSavedProvider(input.provider);
  const modes = modeLookupValues(input.mode);

  for (const mode of modes) {
    const { data, error } = await supabase
      .from('pp_saved_prompts')
      .select('id, collection')
      .eq('user_id', input.userId)
      .eq('original_prompt', input.originalPrompt)
      .eq('optimized_prompt', input.optimizedPrompt)
      .eq('mode', mode)
      .eq('provider', provider)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const collection = typeof data.collection === 'string' ? data.collection : null;
      return { saved: true, collection };
    }
  }

  const { data: byContent, error: contentError } = await supabase
    .from('pp_saved_prompts')
    .select('id, collection')
    .eq('user_id', input.userId)
    .eq('original_prompt', input.originalPrompt)
    .eq('optimized_prompt', input.optimizedPrompt)
    .limit(1)
    .maybeSingle();

  if (contentError || !byContent) return { saved: false, collection: null };
  const collection = typeof byContent.collection === 'string' ? byContent.collection : null;
  return { saved: true, collection };
}

export async function savePromptToLibrary(input: SavePromptInput) {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: new Error('Supabase client not initialized') };

  const { error } = await supabase
    .from('pp_saved_prompts')
    .insert({
      user_id: input.userId,
      title: input.title,
      collection: input.collection,
      original_prompt: input.originalPrompt,
      optimized_prompt: input.optimizedPrompt,
      explanation: input.explanation,
      mode: normalizeSavedMode(input.mode),
      provider: normalizeSavedProvider(input.provider),
    });

  return { error };
}
