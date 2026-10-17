import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/client/supabase';

/** POST /api/auth/resolve-login  Body: { username: string } → { email: string | null } */
export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json() as { username?: string };
    const lookup = username?.trim();
    if (!lookup) {
      return NextResponse.json({ error: 'username is required' }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 });
    }

    const { data, error } = await admin
      .from('personal_info')
      .select('email')
      .ilike('username', lookup)
      .maybeSingle();
    if (error) throw error;

    return NextResponse.json({ email: data?.email ?? null });
  } catch (err) {
    console.error('resolve-login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
