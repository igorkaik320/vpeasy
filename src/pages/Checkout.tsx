import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice, getPlannedProductText, isPlannedProduct } from '@/lib/store-utils';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    nick: '',
    riotId: '',
    server: 'BR',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.nick || !form.riotId) {
      toast.error('Preencha os campos obrigatorios');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map(i => ({
        product_id: i.id,
        name: i.name,
        price: i.promoPrice ?? i.price,
        vp_required: (i as any).vpRequired,
        quantity: i.quantity,
        image: i.image,
        slug: (i as any).slug,
        product_type: (i as any).productType,
        release_days: (i as any).releaseDays,
        planned_description: (i as any).plannedDescription,
      }));
      const productType = items.find(i => (i as any).productType)?.['productType' as any] as string | undefined;

      const { data, error } = await supabase.from('orders').insert({
        user_id: user?.id || null,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        game_nick: form.nick,
        riot_id: form.riotId,
        game_server: form.server,
        game_notes: form.notes,
        product_type: productType,
        release_at: null,
        items: orderItems,
        subtotal: total,
        shipping: 0,
        total,
        status: 'awaiting_seller',
      }).select().single();

      if (error) throw error;

      await supabase
        .from('order_status_history')
        .insert({ order_id: data.id, status: 'awaiting_seller', note: 'Pedido criado aguardando vendedor gerar Pix.' });

      clearCart();
      toast.success('Pedido enviado! O vendedor vai gerar o Pix e falar com voce pelo chat.');
      navigate(user ? '/minha-conta' : '/login');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar pedido');
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    navigate('/carrinho');
    return null;
  }

  const plannedReleaseDays = Math.max(0, ...items.map(i => (i as any).releaseDays || 0));
  const hasPlannedProduct = items.some(item => isPlannedProduct((item as any).productType, (item as any).releaseDays, (item as any).slug || item.name));

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-8 uppercase tracking-wider">Checkout</h1>
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-5 space-y-4 shadow-sm">
              <h2 className="font-heading text-xl font-bold text-foreground uppercase">Dados pessoais</h2>
              <div><Label>Nome completo *</Label><Input name="name" value={form.name} onChange={handleChange} required className="bg-secondary border-border" /></div>
              <div><Label>Email *</Label><Input name="email" type="email" value={form.email} onChange={handleChange} required className="bg-secondary border-border" /></div>
              <div><Label>Telefone / WhatsApp</Label><Input name="phone" value={form.phone} onChange={handleChange} className="bg-secondary border-border" /></div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-4 shadow-sm">
              <h2 className="font-heading text-xl font-bold neon-text uppercase">Dados do jogo</h2>
              <div><Label>Nick no jogo *</Label><Input name="nick" value={form.nick} onChange={handleChange} required placeholder="Ex: PlayerBR" className="bg-secondary border-border" /></div>
              <div><Label>Riot ID *</Label><Input name="riotId" value={form.riotId} onChange={handleChange} required placeholder="Ex: PlayerBR#1234" className="bg-secondary border-border" /></div>
              <div>
                <Label>Servidor</Label>
                <Select value={form.server} onValueChange={(v) => setForm({ ...form, server: v })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BR">Brasil</SelectItem>
                    <SelectItem value="LATAM">LATAM</SelectItem>
                    <SelectItem value="NA">America do Norte</SelectItem>
                    <SelectItem value="EU">Europa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Informacoes adicionais</Label><Textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Ex: melhor horario para receber, skin desejada..." className="bg-secondary border-border" /></div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 space-y-3 shadow-sm">
              <h2 className="font-heading text-xl font-bold text-foreground uppercase">Pagamento</h2>
              <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
                <p className="font-heading font-bold text-primary uppercase">Pix combinado pelo vendedor</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ao confirmar o pedido, ele fica como aguardando vendedor. Voce recebera as instrucoes do Pix pelo chat do pedido.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 h-fit sticky top-20 shadow-sm">
            <h2 className="font-heading text-xl font-bold mb-4 uppercase">Resumo do pedido</h2>
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm py-2 border-b border-border/30">
                <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                <span>{formatPrice((item.promoPrice ?? item.price) * item.quantity)}</span>
              </div>
            ))}
            {hasPlannedProduct && (
              <div className="mt-4 rounded-md border border-accent/20 bg-accent/5 p-3 text-xs text-muted-foreground">
                {getPlannedProductText(plannedReleaseDays, (items.find(item => isPlannedProduct((item as any).productType, (item as any).releaseDays, (item as any).slug || item.name)) as any)?.plannedDescription)}
              </div>
            )}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="neon-text">{formatPrice(total)}</span></div>
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-6 gradient-neon text-primary-foreground font-heading font-bold shadow-md hover:opacity-90 uppercase tracking-wider">
              {loading ? 'Processando...' : 'Confirmar pedido'}
            </Button>
          </div>
        </form>
      </main>
      <StoreFooter />
    </div>
  );
};

export default Checkout;
