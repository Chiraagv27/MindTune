import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/client/supabase';

/**
 * POST /api/auth/check-email
 * Body: { email: string }
 * Header: Authorization: Bearer <access token>
 * Returns { exists: true } only when a different account already uses that email.
 */
export async function POST(req: NextRequest) {
  try {
    const header = req.headers.get('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const { email } = await req.json() as { email?: string };
    const lookup = email?.trim().toLowerCase() ?? '';
    if (!lookup.includes('@')) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 });
    }

    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    if ((userData.user.email ?? '').trim().toLowerCase() === lookup) {
      return NextResponse.json({ exists: false });
    }

    const { data, error } = await admin.rpc('auth_email_taken_by_other', {
      lookup_email: lookup,
      current_user_id: userData.user.id,
    });
    if (error) throw error;

    return NextResponse.json({ exists: Boolean(data) });
  } catch (err) {
    console.error('check-email error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
