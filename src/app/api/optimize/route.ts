import { streamText } from 'ai';
import type { NextRequest } from 'next/server';

import { getModeSystemPrompt } from '@/lib/prompts';
import { splitOptimizedOutput } from '@/lib/delimiter';
import { getLanguageModel, resolveModelList, hasServerKey } from '@/lib/providers';
import { getSupabaseAdminClient } from '@/lib/client/supabase';
import type { Mode, OptimizeRequest, OptimizeVersion, ProviderId } from '@/lib/types';

function isMode(value: unknown): value is Mode {
  return (
    value === 'developer' ||
    value === 'beginner' ||
    value === 'step-by-step'
  );
}

function isProvider(value: unknown): value is ProviderId {
  return (
    value === 'google' ||
    value === 'openai' ||
    value === 'anthropic' ||
    value === 'groq'
  );
}

function resolveModelId(modelIds: string[], modelOverride?: string): string {
  const override = modelOverride?.trim();
  if (override && modelIds.includes(override)) return override;
  const id = modelIds[0];
  if (!id) throw new Error('No model configured for this provider');
  return id;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<OptimizeRequest>;

    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    if (!prompt) {
      return Response.json({ error: 'prompt is required' }, { status: 400 });
    }

    const mode: Mode = isMode(body.mode) ? body.mode : 'developer';
    const provider: ProviderId = isProvider(body.provider) ? body.provider : 'google';
    const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : undefined;
    const modelOverride = typeof body.model === 'string' ? body.model.trim() : undefined;

    console.log('[API] Optimize Request:', {
      mode,
      provider,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
      modelOverride,
    });

    // Check if we have a key (either BYOK or server-side)
    const hasKey = apiKey || hasServerKey(provider);
    if (!hasKey) {
      return Response.json(
        {
          error: 'Open Advanced, paste your API key, and verify it to continue.',
        },
        { status: 400 },
      );
    }

    const system = getModeSystemPrompt(mode);
    const modelIds = resolveModelList({ provider, model: modelOverride ?? '', apiKey });
    const modelId = resolveModelId(modelIds, modelOverride);
    const model = getLanguageModel({ provider, model: modelId, apiKey }, modelId);

    const sessionId = typeof body.session_id === 'string' ? body.session_id.trim() : '';
    const userId = typeof body.user_id === 'string' ? body.user_id.trim() : null;
    const version = (body.version === 'v1' || body.version === 'v2' ? body.version : 'v2') as OptimizeVersion;
    if (sessionId) {
      const supabase = getSupabaseAdminClient();
      if (supabase) {
        const { error } = await supabase.from('optimization_logs').insert({
          session_id: sessionId,
          user_id: userId,
          mode,
          version,
          provider,
          model: modelId,
          prompt_length: prompt.length,
          original_prompt: prompt,
          optimized_length: 0,
          explanation_length: 0,
          prompt_score: null,
        });
        if (error) {
          console.error('Failed to insert optimization log:', error);
        }
      }
    }

    const result = streamText({
      model,
      system,
      prompt,
      maxOutputTokens: 8192,
      onFinish: async ({ text }) => {
        if (!sessionId) return;
        const supabase = getSupabaseAdminClient();
        if (!supabase) return;

        const { optimizedText, explanation, changes } = splitOptimizedOutput(text);
        const { error } = await supabase
          .from('optimization_logs')
          .update({
            optimized_length: optimizedText.length,
            explanation_length: explanation.length + changes.length,
            prompt_score: null,
            optimized_prompt: optimizedText,
            explanation: explanation,
            changes: changes,
          })
          .eq('session_id', sessionId);
        
        if (error) {
          console.error('Failed to update optimization log onFinish:', error);
        }
      },
    });

    // We stream plain text; the client splits `---EXPLANATION---` live.
    return result.toTextStreamResponse({
      headers: {
        'x-promptperfect-provider': provider,
        'x-promptperfect-model': modelId,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to optimize prompt';
    return Response.json({ error: message }, { status: 500 });
  }
}
