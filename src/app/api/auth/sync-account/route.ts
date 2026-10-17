import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/client/supabase';

/** Copies the signed-in account email and username into profile, login, and provider records. */
export async function POST(req: NextRequest) {
  try {
    const header = req.headers.get('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const { username } = await req.json() as { username?: string };
    const nextUsername = username?.trim() ?? '';
    if (nextUsername.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters.' }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 });
    }

    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const { error } = await admin.rpc('sync_account_login', {
      p_user_id: userData.user.id,
      p_username: nextUsername,
    });
    if (error) {
      const message = error.message.includes('already taken')
        ? 'That username is already taken. Please choose another.'
        : error.message;
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({
      username: nextUsername,
      email: userData.user.email ?? '',
    });
  } catch (err) {
    console.error('sync-account error:', err);
    return NextResponse.json({ error: 'Could not update your account.' }, { status: 500 });
  }
}
