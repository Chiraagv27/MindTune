import { type NextRequest, NextResponse } from 'next/server';

import { getSupabaseAdminClient } from '@/lib/client/supabase';

/** GET /api/history?user_id=<uuid>: recent optimizations for the signed-in user */
export async function GET(req: NextRequest) {
  try {
    const user_id = req.nextUrl.searchParams.get('user_id')?.trim();
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('optimization_logs')
      .select(
        'id, original_prompt, optimized_prompt, mode, created_at, prompt_score, explanation, changes, session_id, provider, model',
      )
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[api/history]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ history: data ?? [] });
  } catch (err) {
    console.error('[api/history]', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
