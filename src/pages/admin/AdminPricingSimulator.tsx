import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/store-utils';
import { calculatePricing, formatGiftCombination } from '@/lib/pricing';

const AdminPricingSimulator = () => {
  const [vpRequired, setVpRequired] = useState('1290');
  const [walletBalance, setWalletBalance] = useState(0);
  const [marginPercent, setMarginPercent] = useState(35);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [walletRes, settingsRes, historyRes] = await Promise.all([
        supabase.from('pricing_wallet').select('*').eq('id', true).maybeSingle(),
        supabase.from('store_settings').select('*').eq('key', 'default_margin_percent').maybeSingle(),
        supabase.from('pricing_wallet_history').select('*').order('created_at', { ascending: false }).limit(10),
      ]);
      if (walletRes.data) setWalletBalance(Number(walletRes.data.balance_cny || 0));
      if (settingsRes.data?.value) setMarginPercent(Number(settingsRes.data.value) || 35);
      if (historyRes.data) setHistory(historyRes.data);
    };
    load();
  }, []);

  const result = useMemo(() => calculatePricing(Number(vpRequired || 0), marginPercent, walletBalance), [vpRequired, marginPercent, walletBalance]);

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-6 uppercase tracking-wider">Simulador de Precificacao</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="bg-card border border-border rounded-lg p-6 space-y-5">
          <div>
            <Label>VP necessario</Label>
            <Input type="number" min="1" value={vpRequired} onChange={(e) => setVpRequired(e.target.value)} className="bg-secondary border-border max-w-xs" />
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <Info label="Pacote do jogo recomendado" value={`${result.gamePackage.cny} CNY (${result.gamePackage.vp} VP)`} />
            <Info label="CNY necessario" value={`${result.requiredCny} CNY`} />
            <Info label="Carteira usada" value={`${result.walletUsedCny} CNY`} />
            <Info label="Comprar em gift cards" value={`${result.totalGiftCny} CNY`} />
            <Info label="Sobra" value={`${result.leftoverCny} CNY`} />
            <Info label="Margem" value={`${result.marginPercent}%`} />
            <Info label="Custo real" value={formatPrice(result.operationCost)} />
            <Info label="Lucro" value={formatPrice(result.profit)} />
            <Info label="Preco de venda" value={formatPrice(result.salePrice)} strong />
          </div>

          <div className="rounded-lg bg-secondary border border-border p-4">
            <p className="font-heading font-bold uppercase mb-2">Combinacao ideal de gift cards</p>
            <p className="whitespace-pre-line text-sm text-muted-foreground">{formatGiftCombination(result.giftCards)}</p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <p className="text-sm text-muted-foreground">Saldo da carteira</p>
            <p className="font-heading text-4xl font-bold neon-text">{walletBalance} CNY</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <p className="font-heading font-bold uppercase mb-3">Historico de sobras</p>
            <div className="space-y-3 text-sm">
              {history.length === 0 && <p className="text-muted-foreground">Nenhuma sobra registrada.</p>}
              {history.map(item => (
                <div key={item.id} className="border-b border-border pb-2">
                  <div className="flex justify-between"><span>{item.change_cny > 0 ? '+' : ''}{item.change_cny} CNY</span><strong>{item.balance_after_cny} CNY</strong></div>
                  <p className="text-xs text-muted-foreground">{item.note || 'Movimento da carteira'}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const Info = ({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) => (
  <div className="rounded-lg border border-border bg-secondary/50 p-4">
    <p className="text-xs text-muted-foreground uppercase">{label}</p>
    <p className={`mt-1 font-heading ${strong ? 'text-2xl text-primary font-bold' : 'text-lg font-semibold'}`}>{value}</p>
  </div>
);

export default AdminPricingSimulator;
