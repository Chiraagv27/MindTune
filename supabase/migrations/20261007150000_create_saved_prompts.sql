CREATE TABLE IF NOT EXISTS public.pp_saved_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL,
  original_prompt text NOT NULL,
  optimized_prompt text NOT NULL,
  explanation text NOT NULL DEFAULT '',
  mode text NOT NULL,
  provider text NOT NULL DEFAULT 'google',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pp_saved_prompts_user_created_idx
  ON public.pp_saved_prompts (user_id, created_at DESC);

ALTER TABLE public.pp_saved_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their saved prompts"
  ON public.pp_saved_prompts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users save their prompts"
  ON public.pp_saved_prompts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete their saved prompts"
  ON public.pp_saved_prompts
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON public.pp_saved_prompts TO authenticated;
