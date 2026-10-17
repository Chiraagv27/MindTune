-- Tighten indexes to the queries the app already runs.
-- No tables, columns the app reads, or policies are removed except
-- optimization_logs.rating, which is unused (thumbs are stored in feedback).

DROP INDEX IF EXISTS public.idx_optimization_logs_session_id;
DROP INDEX IF EXISTS public.idx_optimization_logs_user_id;
DROP INDEX IF EXISTS public.idx_optimization_logs_created_at;

CREATE INDEX IF NOT EXISTS idx_optimization_logs_user_created
  ON public.optimization_logs (user_id, created_at DESC);

ALTER TABLE public.optimization_logs DROP COLUMN IF EXISTS rating;

DROP INDEX IF EXISTS public.idx_optimization_qa_session_id;

CREATE INDEX IF NOT EXISTS idx_optimization_qa_session_created
  ON public.optimization_qa (session_id, created_at);

DROP INDEX IF EXISTS public.guest_usage_guest_id_idx;
