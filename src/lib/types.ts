/**
 * Subset of Supabase auth session used in the UI. Declared here so we do not
 * depend on `Session` re-exports from @supabase/supabase-js (varies by version).
 */
export interface AppAuthSession {
  user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
    app_metadata?: {
      provider?: string;
      providers?: string[];
    };
  };
}

export type Mode = 'developer' | 'beginner' | 'step-by-step';

export type ProviderId = 'google' | 'openai' | 'anthropic' | 'groq';

export type OptimizeVersion = 'v1' | 'v2';

export interface OptimizeRequest {
  prompt: string;
  mode: Mode;
  session_id?: string;
  user_id?: string;
  version?: OptimizeVersion;
  provider?: ProviderId;
  /**
   * Optional BYOK key. Never persisted server-side.
   * If not set, server env var for the provider must exist.
   */
  apiKey?: string;
  /**
   * Optional model override (advanced). If not provided, we use defaults/fallbacks.
   */
  model?: string;
}

export interface OptimizeResponseV1 {
  optimizedText: string;
  explanation: string;
  rawText: string;
  provider: ProviderId;
  model: string;
}

