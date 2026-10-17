import { getSupabaseClient } from '@/lib/client/supabase';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  optimization_count: number;
  favorite_mode: string | null;
  created_at: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('pp_user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as UserProfile;
}

export async function updateUserProfile(
  userId: string,
  updates: { display_name?: string; avatar_url?: string | null },
) {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: new Error('Supabase client not initialized') };

  const { error } = await supabase
    .from('pp_user_profiles')
    .update(updates)
    .eq('id', userId);

  return { error };
}

interface OptimizationRow {
  mode: string | null;
  provider: string | null;
  created_at?: string | null;
}

export interface ModeBreakdownItem {
  label: string;
  count: number;
  percent: number;
}

export interface DailyRunPoint {
  dateKey: string;
  label: string;
  count: number;
}

export interface UserAnalytics {
  total: number;
  favoriteMode: string | null;
  favoriteProvider: string | null;
  modeBreakdown: ModeBreakdownItem[];
  providerBreakdown: ModeBreakdownItem[];
  dailyRuns: DailyRunPoint[];
  growthPercent: number | null;
}

const emptyStats: UserAnalytics = {
  total: 0,
  favoriteMode: null,
  favoriteProvider: null,
  modeBreakdown: [],
  providerBreakdown: [],
  dailyRuns: [],
  growthPercent: null,
};

function modeLabel(mode: string) {
  const key = mode.trim().toLowerCase();
  if (key === 'beginner') return 'Beginner';
  if (key === 'step-by-step' || key === 'cot') return 'Step-by-step';
  return 'Developer';
}

function providerLabel(provider: string) {
  const names: Record<string, string> = {
    google: 'Google',
    gemini: 'Google',
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    groq: 'Groq',
  };
  return names[provider.toLowerCase()] ?? provider;
}

function topKey(counts: Record<string, number>) {
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function toBreakdown(counts: Record<string, number>): ModeBreakdownItem[] {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return [];
  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

function startOfUtcDay(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function buildDailyRuns(optimizations: OptimizationRow[], days = 14): DailyRunPoint[] {
  const today = new Date();
  const buckets = new Map<string, number>();

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(startOfUtcDay(today) - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, 0);
  }

  for (const opt of optimizations) {
    if (!opt.created_at) continue;
    const key = opt.created_at.slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return [...buckets.entries()].map(([dateKey, count]) => {
    const d = new Date(`${dateKey}T12:00:00.000Z`);
    const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return { dateKey, label, count };
  });
}

function computeGrowthPercent(dailyRuns: DailyRunPoint[]): number | null {
  if (dailyRuns.length < 14) return null;
  const last7 = dailyRuns.slice(-7).reduce((a, p) => a + p.count, 0);
  const prev7 = dailyRuns.slice(-14, -7).reduce((a, p) => a + p.count, 0);
  if (prev7 === 0) return last7 > 0 ? 100 : 0;
  return Math.round(((last7 - prev7) / prev7) * 100);
}

export function analyticsFromHistory(history: OptimizationRow[]): UserAnalytics {
  if (history.length === 0) return emptyStats;

  const modeCounts: Record<string, number> = {};
  const providerCounts: Record<string, number> = {};

  for (const opt of history) {
    if (opt.mode) {
      const label = modeLabel(opt.mode);
      modeCounts[label] = (modeCounts[label] || 0) + 1;
    }
    if (opt.provider) {
      const label = providerLabel(opt.provider);
      providerCounts[label] = (providerCounts[label] || 0) + 1;
    }
  }

  const dailyRuns = buildDailyRuns(history);

  return {
    total: history.length,
    favoriteMode: topKey(modeCounts),
    favoriteProvider: topKey(providerCounts),
    modeBreakdown: toBreakdown(modeCounts),
    providerBreakdown: toBreakdown(providerCounts),
    dailyRuns,
    growthPercent: computeGrowthPercent(dailyRuns),
  };
}

export async function getUserStats(userId: string): Promise<UserAnalytics> {
  try {
    const { fetchOptimizationHistory } = await import('@/lib/client/optimizationHistory');
    const { history, error } = await fetchOptimizationHistory(userId);
    if (error) return emptyStats;
    return analyticsFromHistory(
      history.map((row) => ({
        mode: row.mode,
        provider: row.provider ?? null,
        created_at: row.created_at,
      })),
    );
  } catch {
    return emptyStats;
  }
}
