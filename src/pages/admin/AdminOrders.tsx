import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice, getPlannedProductText, isPlannedProduct, STATUS_LABELS } from '@/lib/store-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import OrderChat from '@/components/store/OrderChat';
import { ChevronLeft, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { calculatePricing } from '@/lib/pricing';

const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

const getOrderReleaseDays = (order: any) =>
  Math.max(0, ...((order.items as any[]) || []).map((it) => Number(it.release_days || 0)));

const hasPlannedOrderItem = (order: any) =>
  ((order.items as any[]) || []).some((it) => isPlannedProduct(it.product_type || order.product_type, it.release_days, it.slug || it.name));

const getPlannedOrderText = (order: any) => {
  const item = ((order.items as any[]) || []).find((it) => isPlannedProduct(it.product_type || order.product_type, it.release_days, it.slug || it.name));
  return getPlannedProductText(getOrderReleaseDays(order) || 15, item?.planned_description);
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [releaseDays, setReleaseDays] = useState('15');

  const load = () => {
    supabase.from('orders').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setOrders(data); });
  };
  useEffect(load, []);

  const syncSelected = (patch: Record<string, any>) => {
    if (selected) setSelected({ ...selected, ...patch });
  };

  const applyPricingWalletForOrder = async (order: any) => {
    if (order.pricing_wallet_applied) return {};
    const billableStatuses = ['paid', 'approved', 'processing', 'awaiting_release'];
    if (!billableStatuses.includes(order.status)) return {};

    const [{ data: wallet }, { data: settings }] = await Promise.all([
      supabase.from('pricing_wallet').select('*').eq('id', true).maybeSingle(),
      supabase.from('store_settings').select('*').eq('key', 'default_margin_percent').maybeSingle(),
    ]);

    let balance = Number(wallet?.balance_cny || 0);
    const margin = Number(settings?.value || 35);
    let netChange = 0;

    for (const item of ((order.items as any[]) || [])) {
      const vp = Number(item.vp_required || 0);
      if (!vp) continue;
      const result = calculatePricing(vp, margin, balance);
      balance = balance - result.walletUsedCny + result.leftoverCny;
      netChange += result.leftoverCny - result.walletUsedCny;
    }

    const { error } = await supabase.from('pricing_wallet').upsert({ id: true, balance_cny: balance }, { onConflict: 'id' });
    if (error) throw error;

    await supabase.from('pricing_wallet_history').insert({
      order_id: order.id,
      change_cny: netChange,
      balance_after_cny: balance,
      note: `Carteira aplicada no pedido #${order.id.slice(0, 8)}`,
    });

    return { pricing_wallet_applied: true };
  };

  const updateStatus = async (id: string, status: string) => {
    const baseOrder = selected?.id === id ? selected : orders.find((order) => order.id === id);
    const orderForWallet = baseOrder ? { ...baseOrder, status } : null;
    let walletPatch = {};
    try {
      if (orderForWallet) walletPatch = await applyPricingWalletForOrder(orderForWallet);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao aplicar carteira');
      return;
    }

    const { error } = await supabase.from('orders').update({ status, ...walletPatch }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    await supabase.from('order_status_history').insert({ order_id: id, status });
    toast.success('Status atualizado!');
    load();
    syncSelected({ status, ...walletPatch });
  };

  const startReleaseTimer = async () => {
    if (!selected) return;
    const days = Number(releaseDays);
    if (!Number.isFinite(days) || days <= 0) {
      toast.error('Informe um prazo maior que zero.');
      return;
    }

    const releaseAt = new Date(Date.now() + days * 86400000).toISOString();
    let walletPatch = {};
    try {
      walletPatch = await applyPricingWalletForOrder({ ...selected, status: 'awaiting_release' });
    } catch (err: any) {
      toast.error(err.message || 'Erro ao aplicar carteira');
      return;
    }
    const { error } = await supabase
      .from('orders')
      .update({ release_at: releaseAt, status: 'awaiting_release', ...walletPatch })
      .eq('id', selected.id);

    if (error) { toast.error(error.message); return; }
    await supabase.from('order_status_history').insert({
      order_id: selected.id,
      status: 'awaiting_release',
      note: `Prazo de entrega iniciado por ${days} dia(s).`,
    });
    toast.success('Prazo iniciado para este cliente.');
    load();
    syncSelected({ release_at: releaseAt, status: 'awaiting_release', ...walletPatch });
  };

  const clearReleaseTimer = async () => {
    if (!selected) return;
    const { error } = await supabase.from('orders').update({ release_at: null }).eq('id', selected.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Prazo removido.');
    load();
    syncSelected({ release_at: null });
  };

  if (selected) {
    const defaultDays = getOrderReleaseDays(selected) || 15;
    const planned = hasPlannedOrderItem(selected) || isPlannedProduct(selected.product_type, defaultDays);
    const quickMessages = [
      `Ola, ${selected.customer_name}! Recebi seu pedido #${selected.id.slice(0, 8)} no valor de ${formatPrice(selected.total)}. Vou gerar o Pix para pagamento e enviar por aqui. Depois do pagamento, mande o comprovante neste chat para eu conferir.`,
      `Pagamento conferido. Agora vou colocar seu pedido em processamento e te aviso por aqui sobre as proximas etapas.`,
      `Para este produto de compra planejada, o prazo so comeca depois da confirmacao do pagamento e do inicio manual pelo vendedor.`,
    ];

    return (
      <div>
        <Button variant="ghost" onClick={() => setSelected(null)} className="mb-4"><ChevronLeft className="h-4 w-4 mr-1"/> Voltar</Button>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-primary/30 rounded-lg p-5">
              <h2 className="font-heading text-2xl font-bold uppercase mb-2">Pedido #{selected.id.slice(0,8)}</h2>
              <p className="text-sm text-muted-foreground">{new Date(selected.created_at).toLocaleString('pt-BR')}</p>
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <div><span className="text-muted-foreground">Cliente:</span> {selected.customer_name}</div>
                <div><span className="text-muted-foreground">Email:</span> {selected.customer_email}</div>
                <div><span className="text-muted-foreground">Telefone:</span> {selected.customer_phone || '-'}</div>
                <div><span className="text-muted-foreground">Nick:</span> {selected.game_nick || '-'}</div>
                <div><span className="text-muted-foreground">Riot ID:</span> {selected.riot_id || '-'}</div>
                <div><span className="text-muted-foreground">Servidor:</span> {selected.game_server || '-'}</div>
              </div>
              {selected.game_notes && <p className="text-sm mt-3 text-muted-foreground italic">"{selected.game_notes}"</p>}
              <div className="mt-4 space-y-2 border-t border-border/30 pt-3">
                {(selected.items as any[]).map((it, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{it.name} x{it.quantity}</span>
                    <span className="neon-text font-bold">{formatPrice(it.price * it.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 border-t border-border/30">
                  <span>Total</span>
                  <span className="neon-text">{formatPrice(selected.total)}</span>
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-xs text-muted-foreground uppercase">Status</Label>
                <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v)}>
                  <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {planned && (
              <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-bold uppercase mb-1">Prazo do produto planejado</h3>
                    <p className="text-sm text-muted-foreground">{getPlannedOrderText(selected)}</p>
                    {selected.release_at && (
                      <p className="text-sm text-primary mt-2">Contador ativo ate {new Date(selected.release_at).toLocaleString('pt-BR')}.</p>
                    )}
                  </div>
                  <Clock className="h-5 w-5 text-primary shrink-0" />
                </div>
                <div className="mt-4 grid sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
                  <div>
                    <Label>Dias para entrega</Label>
                    <Input type="number" min="1" value={releaseDays} onChange={(e) => setReleaseDays(e.target.value)} placeholder={String(defaultDays)} className="bg-secondary border-border" />
                  </div>
                  <Button onClick={startReleaseTimer} className="gradient-neon text-primary-foreground font-heading">
                    Iniciar prazo
                  </Button>
                  {selected.release_at && <Button variant="outline" onClick={clearReleaseTimer}>Limpar prazo</Button>}
                </div>
              </div>
            )}
          </div>
          <div>
            <OrderChat orderId={selected.id} quickMessages={quickMessages} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-6 uppercase tracking-wider">Pedidos</h1>
      <div className="bg-card border border-primary/20 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-heading">Pedido</th>
              <th className="px-4 py-3 text-left font-heading">Cliente</th>
              <th className="px-4 py-3 text-left font-heading">Nick / Riot ID</th>
              <th className="px-4 py-3 text-left font-heading">Total</th>
              <th className="px-4 py-3 text-left font-heading">Data</th>
              <th className="px-4 py-3 text-left font-heading">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-t border-border/30 hover:bg-secondary/30">
                <td className="px-4 py-3 text-muted-foreground">#{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3">{o.customer_name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{o.game_nick} / {o.riot_id}</td>
                <td className="px-4 py-3 neon-text font-bold">{formatPrice(o.total)}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="border-primary/40 text-primary text-xs">{STATUS_LABELS[o.status] || o.status}</Badge></td>
                <td className="px-4 py-3"><Button size="sm" variant="outline" onClick={() => { setSelected(o); setReleaseDays(String(getOrderReleaseDays(o) || 15)); }}>Ver</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-8 text-center text-muted-foreground">Nenhum pedido encontrado.</p>}
      </div>
    </div>
  );
};

export default AdminOrders;
