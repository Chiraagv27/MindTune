import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/client/supabase';

/** POST /api/auth/account-exists  Body: { email: string } */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email?: string };
    const lookup = email?.trim();
    if (!lookup) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 });
    }

    const { data, error } = await admin.rpc('auth_email_exists', { lookup_email: lookup });
    if (error) throw error;

    return NextResponse.json({ exists: Boolean(data) });
  } catch (err) {
    console.error('account-exists error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
