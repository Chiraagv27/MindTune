import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { getLanguageModel, getDefaultModels } from '@/lib/providers';
import type { ProviderId } from '@/lib/types';

const VALID_PROVIDERS: ProviderId[] = ['google', 'openai', 'anthropic', 'groq'];

function isProvider(p: unknown): p is ProviderId {
  return VALID_PROVIDERS.includes(p as ProviderId);
}

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey } = await req.json();

    if (!isProvider(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }
    if (!apiKey?.trim()) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    const models = getDefaultModels(provider);
    if (!models.length) {
      return NextResponse.json({ error: 'No models available for provider' }, { status: 400 });
    }

    // Make a minimal single-token call to verify the key
    await generateText({
      model: getLanguageModel({ provider, apiKey: apiKey.trim(), model: '' }, models[0]),
      prompt: 'Say "ok".',
      maxOutputTokens: 5,
    });

    return NextResponse.json({ valid: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    let reason = 'Invalid API key or insufficient permissions.';

    if (msg.toLowerCase().includes('api key') || msg.toLowerCase().includes('authentication') || msg.includes('401') || msg.includes('403')) {
      reason = 'Invalid API key.';
    } else if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit')) {
      reason = 'Key is valid but rate limited or quota exceeded.';
    } else if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
      reason = 'Model not found, but your key may still be valid.';
    }

    return NextResponse.json({ valid: false, reason }, { status: 200 });
  }
}
