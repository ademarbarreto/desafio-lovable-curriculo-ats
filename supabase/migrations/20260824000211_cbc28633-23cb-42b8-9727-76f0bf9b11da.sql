ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS evidencias jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS lacunas_detalhadas jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS curriculo_adaptado jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS gerado_por_ia boolean NOT NULL DEFAULT false;