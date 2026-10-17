import { generateText } from 'ai';
import type { NextRequest } from 'next/server';

import { getLanguageModel, hasServerKey, resolveModelList } from '@/lib/providers';
import { getSupabaseAdminClient } from '@/lib/client/supabase';
import type { ProviderId } from '@/lib/types';

function isProvider(value: unknown): value is ProviderId {
  return (
    value === 'google' ||
    value === 'openai' ||
    value === 'anthropic' ||
    value === 'groq'
  );
}

/** POST /api/qa: answer a follow-up question about the optimized prompt; persists Q&A rows */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      prompt?: unknown;
      explanation?: unknown;
      question?: unknown;
      provider?: unknown;
      apiKey?: unknown;
      session_id?: unknown;
    };

    const optimizedPrompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const explanation = typeof body.explanation === 'string' ? body.explanation.trim() : '';
    const question = typeof body.question === 'string' ? body.question.trim() : '';
    const session_id = typeof body.session_id === 'string' ? body.session_id.trim() : '';
    const provider = isProvider(body.provider) ? body.provider : null;
    const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : undefined;

    if (!optimizedPrompt || !question || !session_id || !provider) {
      return Response.json({ error: 'prompt, question, session_id, and provider are required' }, { status: 400 });
    }

    const hasKey = Boolean(apiKey) || hasServerKey(provider);
    if (!hasKey) {
      return Response.json({ error: 'Missing API key for this provider' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return Response.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const { data: log, error: logErr } = await supabase
      .from('optimization_logs')
      .select('session_id')
      .eq('session_id', session_id)
      .maybeSingle();

    if (logErr) {
      console.error('[api/qa] log lookup', logErr);
      return Response.json({ error: logErr.message }, { status: 500 });
    }
    if (!log) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const { error: insUserErr } = await supabase.from('optimization_qa').insert({
      session_id,
      role: 'user',
      content: question,
    });
    if (insUserErr) {
      console.error('[api/qa] insert user', insUserErr);
      return Response.json({ error: insUserErr.message }, { status: 500 });
    }

    const modelIds = resolveModelList({ provider, model: '', apiKey });
    const modelId = modelIds[0];
    if (!modelId) {
      return Response.json({ error: 'No model available for provider' }, { status: 400 });
    }

    const model = getLanguageModel({ provider, model: modelId, apiKey }, modelId);

    const system = `You help users understand an optimized AI prompt and the edits that produced it.
Answer clearly and concisely. Use Markdown when it helps (short lists, bold for emphasis).
If the question is unrelated to the prompt or explanation, politely steer back to clarifying the prompt or the edits.
Do not invent API keys or instructions that were not present in the optimized prompt unless the user asks for general guidance.`;

    const userContent = `## Optimized prompt\n${optimizedPrompt}\n\n## What changed / why\n${explanation || '(none)'}\n\n## User question\n${question}`;

    const { text } = await generateText({
      model,
      system,
      prompt: userContent,
      maxOutputTokens: 2048,
    });

    const answer = text.trim() || 'Sorry, no answer was generated.';

    const { error: insAsstErr } = await supabase.from('optimization_qa').insert({
      session_id,
      role: 'assistant',
      content: answer,
    });
    if (insAsstErr) {
      console.error('[api/qa] insert assistant', insAsstErr);
    }

    return Response.json({ answer });
  } catch (err) {
    console.error('[api/qa]', err);
    const message = err instanceof Error ? err.message : 'Failed to answer question';
    return Response.json({ error: message }, { status: 500 });
  }
}
