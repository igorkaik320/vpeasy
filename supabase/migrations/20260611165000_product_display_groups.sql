ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS display_group text;
