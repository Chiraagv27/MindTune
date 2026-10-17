import { getSupabaseClient } from '@/lib/client/supabase';

export interface OptimizationHistoryRow {
  id: string;
  original_prompt: string;
  optimized_prompt: string;
  mode: string;
  created_at: string;
  prompt_score: number | null;
  explanation?: string;
  changes?: string;
  session_id: string;
  provider?: string;
  model?: string;
}

const HISTORY_SELECT =
  'id, original_prompt, optimized_prompt, mode, created_at, prompt_score, explanation, changes, session_id, provider, model';

/** Load recent runs in the browser (avoids server→Supabase timeouts on /api/history). */
export async function fetchOptimizationHistory(userId: string): Promise<{
  history: OptimizationHistoryRow[];
  error: string | null;
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { history: [], error: 'Database client is not configured.' };
  }

  const { data, error } = await supabase
    .from('optimization_logs')
    .select(HISTORY_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { history: [], error: error.message };
  }

  return { history: (data ?? []) as OptimizationHistoryRow[], error: null };
}

export async function deleteOptimizationHistoryRow(
  userId: string,
  row: Pick<
    OptimizationHistoryRow,
    'id' | 'original_prompt' | 'optimized_prompt' | 'mode' | 'provider'
  >,
): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return 'Database client is not configured.';

  const { error } = await supabase
    .from('optimization_logs')
    .delete()
    .eq('id', row.id)
    .eq('user_id', userId);

  if (error) return error.message;

  const provider = row.provider?.trim() || 'google';
  await supabase
    .from('pp_saved_prompts')
    .delete()
    .eq('user_id', userId)
    .eq('original_prompt', row.original_prompt)
    .eq('optimized_prompt', row.optimized_prompt ?? '')
    .eq('mode', row.mode)
    .eq('provider', provider);

  return null;
}
