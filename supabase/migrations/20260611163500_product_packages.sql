ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS package_contents text;
