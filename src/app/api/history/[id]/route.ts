import { type NextRequest, NextResponse } from 'next/server';

import { getSupabaseAdminClient } from '@/lib/client/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** DELETE /api/history/[id]?user_id=<uuid>: delete one history row (and cascaded QA) */
export async function DELETE(req: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const user_id = req.nextUrl.searchParams.get('user_id')?.trim();
    if (!user_id || !id) {
      return NextResponse.json({ error: 'user_id and id are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const { data: target, error: targetErr } = await supabase
      .from('optimization_logs')
      .select('id, original_prompt, optimized_prompt, mode, provider')
      .eq('id', id)
      .eq('user_id', user_id)
      .maybeSingle();

    if (targetErr) {
      console.error('[api/history/[id]] target lookup', targetErr);
      return NextResponse.json({ error: targetErr.message }, { status: 500 });
    }

    if (!target) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('optimization_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id)
      .select('id')
      .single();

    if (error) {
      console.error('[api/history/[id]]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { error: libraryDeleteError } = await supabase
      .from('pp_saved_prompts')
      .delete()
      .eq('user_id', user_id)
      .eq('original_prompt', target.original_prompt)
      .eq('optimized_prompt', target.optimized_prompt)
      .eq('mode', target.mode)
      .eq('provider', target.provider ?? 'google');

    if (libraryDeleteError) {
      console.error('[api/history/[id]] library cleanup', libraryDeleteError);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/history/[id]]', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
