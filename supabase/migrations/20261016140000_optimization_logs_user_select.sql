-- Let signed-in users load Recent Prompts from the browser (no service-role round-trip).

DROP POLICY IF EXISTS optimization_logs_select_own ON public.optimization_logs;
CREATE POLICY optimization_logs_select_own
  ON public.optimization_logs
  FOR SELECT
  TO authenticated
  USING (user_id IS NOT NULL AND user_id::text = (auth.uid())::text);

DROP POLICY IF EXISTS optimization_logs_delete_own ON public.optimization_logs;
CREATE POLICY optimization_logs_delete_own
  ON public.optimization_logs
  FOR DELETE
  TO authenticated
  USING (user_id IS NOT NULL AND user_id::text = (auth.uid())::text);

GRANT SELECT, DELETE ON public.optimization_logs TO authenticated;
