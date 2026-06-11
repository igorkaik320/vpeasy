import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice, getPlannedProductText, isPlannedProduct, STATUS_LABELS } from '@/lib/store-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Countdown from '@/components/store/Countdown';
import OrderChat from '@/components/store/OrderChat';
import { Gift, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

const getOrderReleaseDays = (order: any) =>
  Math.max(0, ...((order.items as any[]) || []).map((it) => Number(it.release_days || 0)));

const hasPlannedOrderItem = (order: any) =>
  ((order.items as any[]) || []).some((it) => isPlannedProduct(it.product_type || order.product_type, it.release_days, it.slug || it.name));

const getPlannedOrderText = (order: any) => {
  const item = ((order.items as any[]) || []).find((it) => isPlannedProduct(it.product_type || order.product_type, it.release_days, it.slug || it.name));
  return getPlannedProductText(getOrderReleaseDays(order) || 15, item?.planned_description);
};

const MyAccount = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const orderId = params.get('order');
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => { if (!loading && !user) navigate('/login'); }, [user, loading]);

  const loadOrders = () => {
    if (!user) return;
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setOrders(data); });
  };
  useEffect(loadOrders, [user]);

  useEffect(() => {
    if (orderId && orders.length) setSelected(orders.find(o => o.id === orderId) || null);
    else setSelected(null);
  }, [orderId, orders]);

  if (loading || !user) return null;

  const requestGift = async () => {
    if (!selected) return;
    const { error } = await supabase.from('gift_requests').insert({ order_id: selected.id, user_id: user.id });
    if (error) { toast.error(error.message); return; }
    await supabase.from('orders').update({ status: 'ready' }).eq('id', selected.id);
    toast.success('Solicitacao enviada ao vendedor!');
    loadOrders();
  };

  if (selected) {
    const plannedDays = getOrderReleaseDays(selected);
    const planned = hasPlannedOrderItem(selected) || isPlannedProduct(selected.product_type, plannedDays);
    const releaseStarted = !!selected.release_at && !['awaiting_seller', 'pending'].includes(selected.status);
    const releaseReady = releaseStarted && new Date(selected.release_at).getTime() <= Date.now();

    return (
      <div className="min-h-screen bg-background">
        <StoreHeader />
        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setParams({})} className="mb-4"><ChevronLeft className="h-4 w-4 mr-1"/> Voltar</Button>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-card border border-primary/30 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <h1 className="font-heading text-2xl font-bold uppercase">Pedido #{selected.id.slice(0,8)}</h1>
                  <Badge className="gradient-neon text-primary-foreground border-0">{STATUS_LABELS[selected.status] || selected.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{new Date(selected.created_at).toLocaleString('pt-BR')}</p>
                <div className="mt-4 space-y-2">
                  {(selected.items as any[]).map((it, i) => (
                    <div key={i} className="flex justify-between text-sm border-b border-border/30 pb-2">
                      <span>{it.name} x{it.quantity}</span>
                      <span className="neon-text font-bold">{formatPrice(it.price * it.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-2">
                    <span>Total</span>
                    <span className="neon-text">{formatPrice(selected.total)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-primary/20 rounded-lg p-5">
                <h3 className="font-heading font-bold uppercase mb-3">Dados do jogo</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Nick:</span> {selected.game_nick || '-'}</div>
                  <div><span className="text-muted-foreground">Riot ID:</span> {selected.riot_id || '-'}</div>
                  <div><span className="text-muted-foreground">Servidor:</span> {selected.game_server || '-'}</div>
                </div>
                {selected.game_notes && <p className="text-sm mt-3 text-muted-foreground">"{selected.game_notes}"</p>}
              </div>

              {planned && (
                <div className="bg-card border border-primary/40 rounded-lg p-5 neon-border">
                  <h3 className="font-heading font-bold uppercase mb-3">Compra planejada</h3>
                  {!releaseStarted ? (
                    <p className="text-sm text-muted-foreground">
                      {getPlannedOrderText(selected)} O contador aparece aqui somente depois que o vendedor confirmar o pagamento e iniciar o prazo do pedido.
                    </p>
                  ) : releaseReady ? (
                    <Button onClick={requestGift} className="w-full gradient-neon text-primary-foreground font-heading font-bold neon-glow uppercase tracking-wider">
                      <Gift className="h-4 w-4 mr-2" /> Receber item
                    </Button>
                  ) : (
                    <Countdown target={selected.release_at} onComplete={loadOrders} />
                  )}
                </div>
              )}
            </div>
            <div>
              <OrderChat orderId={selected.id} />
            </div>
          </div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wider">Minha <span className="neon-text">Conta</span></h1>
          <Button variant="outline" onClick={() => { signOut(); navigate('/'); }} className="border-border">Sair</Button>
        </div>

        <h2 className="font-heading text-xl font-bold mb-4 uppercase">Meus pedidos</h2>
        {orders.length === 0 ? (
          <p className="text-muted-foreground">Nenhum pedido encontrado. <Link to="/produtos" className="text-primary">Ver produtos</Link></p>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <button key={order.id} onClick={() => setParams({ order: order.id })} className="w-full text-left bg-card border border-primary/20 hover:border-primary/60 rounded-lg p-4 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Pedido #{order.id.slice(0, 8)}</span>
                  <Badge variant="outline" className="border-primary/50 text-primary">{STATUS_LABELS[order.status] || order.status}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                  <span className="font-bold neon-text">{formatPrice(order.total)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
      <StoreFooter />
    </div>
  );
};

export default MyAccount;
