ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS vp_required integer,
  ADD COLUMN IF NOT EXISTS game_package_cny integer,
  ADD COLUMN IF NOT EXISTS game_package_vp integer,
  ADD COLUMN IF NOT EXISTS required_cny integer,
  ADD COLUMN IF NOT EXISTS wallet_used_cny integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gift_card_total_cny integer,
  ADD COLUMN IF NOT EXISTS gift_card_combo jsonb,
  ADD COLUMN IF NOT EXISTS real_cost numeric(10,2),
  ADD COLUMN IF NOT EXISTS profit numeric(10,2),
  ADD COLUMN IF NOT EXISTS margin_percent integer,
  ADD COLUMN IF NOT EXISTS leftover_cny integer DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.pricing_wallet (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  balance_cny integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.pricing_wallet (id, balance_cny)
VALUES (true, 0)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.pricing_wallet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pricing wallet"
ON public.pricing_wallet FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.pricing_wallet_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  change_cny integer NOT NULL,
  balance_after_cny integer NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_wallet_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view pricing wallet history"
ON public.pricing_wallet_history FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert pricing wallet history"
ON public.pricing_wallet_history FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.store_settings (key, value)
VALUES ('default_margin_percent', '35')
ON CONFLICT (key) DO NOTHING;
