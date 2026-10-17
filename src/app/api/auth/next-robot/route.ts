import { createHash, randomBytes } from 'crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/client/supabase';

function robotFromSeed(seed: string) {
  const hash = createHash('md5').update(seed).digest('hex');
  return {
    hash,
    url: `https://robohash.org/${hash}?set=set1&size=128x128`,
  };
}

/**
 * GET /api/auth/next-robot
 * Returns a RoboHash set1 robot that no other account is using.
 */
export async function GET(req: NextRequest) {
  try {
    const header = req.headers.get('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const admin = getSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 });
    }

    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const { data: mine } = await admin
      .from('pp_user_profiles')
      .select('robot_hash')
      .eq('id', userData.user.id)
      .maybeSingle();
    const ownHash = (mine?.robot_hash as string | null)?.toLowerCase() ?? '';

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const candidate = robotFromSeed(randomBytes(16).toString('hex'));
      if (candidate.hash === ownHash) continue;

      const { data, error } = await admin.rpc('robot_hash_available', {
        p_hash: candidate.hash,
        p_user_id: userData.user.id,
      });
      if (error) throw error;
      if (data) return NextResponse.json({ url: candidate.url });
    }

    return NextResponse.json({ error: 'Could not find an unused robot.' }, { status: 409 });
  } catch (err) {
    console.error('next-robot error:', err);
    return NextResponse.json({ error: 'Could not find an unused robot.' }, { status: 500 });
  }
}
