import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/client/supabase';

const NEW_ACCOUNT_WINDOW_MS = 2 * 60 * 1000;

/**
 * A login attempt must not create an account. If this session belongs to a
 * user created moments ago, remove that account so they can sign up properly.
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return NextResponse.json({ error: 'Missing session' }, { status: 401 });
    }

    const admin = getSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 });
    }

    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const createdAt = new Date(data.user.created_at).getTime();
    if (!Number.isFinite(createdAt) || Date.now() - createdAt > NEW_ACCOUNT_WINDOW_MS) {
      return NextResponse.json({ rejected: false });
    }

    await admin.from('pp_users').delete().eq('id', data.user.id);
    const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ rejected: true });
  } catch (err) {
    console.error('require-signup error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
