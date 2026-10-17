import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

import { SharedPromptNotFound } from '@/components/share/SharedPromptNotFound';
import { SharedPromptView } from '@/components/share/SharedPromptView';
import { formatShortDate } from '@/lib/formatDate';
import { pageMetadata } from '@/lib/seo/metadata';

interface SharePageProps {
  params: Promise<{ shareId: string }>;
}

async function getSharedOptimization(shareId: string) {
  const urlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const keyRaw = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = typeof urlRaw === 'string' ? urlRaw.trim().replace(/\/+$/, '') : '';
  const key = typeof keyRaw === 'string' ? keyRaw.trim() : '';
  if (!url || !key) return null;

  const supabase = createClient(url, key);
  const { data } = await supabase
    .from('optimization_logs')
    .select('original_prompt, optimized_prompt, explanation, changes, mode, created_at')
    .eq('share_id', shareId)
    .maybeSingle();

  return data;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { shareId } = await params;
  return pageMetadata({
    title: 'Shared optimized prompt',
    description: 'View a MindTune optimization shared with you—original prompt, tuned version, and explanation.',
    path: `/s/${shareId}`,
  });
}

export default async function SharedPage({ params }: SharePageProps) {
  const { shareId } = await params;
  const data = await getSharedOptimization(shareId);

  if (!data) {
    return <SharedPromptNotFound />;
  }

  return (
    <SharedPromptView
      sharePath={`/s/${shareId}`}
      data={{
        original_prompt: data.original_prompt ?? '',
        optimized_prompt: data.optimized_prompt ?? '',
        explanation: data.explanation ?? null,
        changes: data.changes ?? null,
        mode: data.mode ?? null,
        createdAtLabel: data.created_at ? formatShortDate(data.created_at) : null,
      }}
    />
  );
}
