ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS pricing_wallet_applied boolean NOT NULL DEFAULT false;
