ALTER TABLE public.menu_articles
  ADD COLUMN tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN price_label text,
  ADD COLUMN extra_prices jsonb NOT NULL DEFAULT '[]'::jsonb;