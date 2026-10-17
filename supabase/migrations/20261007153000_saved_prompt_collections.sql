ALTER TABLE public.pp_saved_prompts
  ADD COLUMN IF NOT EXISTS collection text;

UPDATE public.pp_saved_prompts
SET collection = title
WHERE collection IS NULL OR btrim(collection) = '';

ALTER TABLE public.pp_saved_prompts
  ALTER COLUMN collection SET NOT NULL;

CREATE INDEX IF NOT EXISTS pp_saved_prompts_user_collection_idx
  ON public.pp_saved_prompts (user_id, collection);
