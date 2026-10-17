import { type NextRequest, NextResponse } from 'next/server';

import { getSupabaseAdminClient } from '@/lib/client/supabase';

/** GET /api/qa-history?session_id=: saved Q&A messages for a session */
export async function GET(req: NextRequest) {
  try {
    const session_id = req.nextUrl.searchParams.get('session_id')?.trim();
    if (!session_id) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('optimization_qa')
      .select('role, content')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[api/qa-history]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const messages = (data ?? []).map((row) => ({
      role: row.role as 'user' | 'assistant',
      content: row.content,
    }));

    return NextResponse.json({ messages });
  } catch (err) {
    console.error('[api/qa-history]', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
