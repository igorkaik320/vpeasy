import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/store-utils';
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
    name: '', email: '', phone: '',
    nick: '', riotId: '', server: 'BR', notes: '',
    payment: 'pix'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.nick || !form.riotId) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    setLoading(true);
    try {
      const orderItems = items.map(i => ({
        product_id: i.id, name: i.name, price: i.promoPrice ?? i.price, quantity: i.quantity, image: i.image,
        product_type: (i as any).productType, release_days: (i as any).releaseDays,
      }));

      const releaseDays = Math.max(0, ...items.map(i => (i as any).releaseDays || 0));
      const releaseAt = releaseDays > 0 ? new Date(Date.now() + releaseDays * 86400000).toISOString() : null;
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
        release_at: releaseAt,
        items: orderItems,
        subtotal: total,
        shipping: 0,
        total,
        status: 'pending'
      }).select().single();

      if (error) throw error;
      clearCart();
      toast.success('Pedido realizado! Acompanhe na sua conta.');
      navigate(user ? `/minha-conta` : '/login');
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

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-8 uppercase tracking-wider">Checkout</h1>
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card border border-primary/20 rounded-lg p-5 space-y-4">
              <h2 className="font-heading text-xl font-bold text-foreground uppercase">Dados Pessoais</h2>
              <div><Label>Nome completo *</Label><Input name="name" value={form.name} onChange={handleChange} required className="bg-secondary border-border" /></div>
              <div><Label>Email *</Label><Input name="email" type="email" value={form.email} onChange={handleChange} required className="bg-secondary border-border" /></div>
              <div><Label>Telefone / WhatsApp</Label><Input name="phone" value={form.phone} onChange={handleChange} className="bg-secondary border-border" /></div>
            </div>

            <div className="bg-card border border-primary/30 rounded-lg p-5 space-y-4">
              <h2 className="font-heading text-xl font-bold neon-text uppercase">Dados do Jogo</h2>
              <div><Label>Nick no jogo *</Label><Input name="nick" value={form.nick} onChange={handleChange} required placeholder="Ex: PlayerBR" className="bg-secondary border-border" /></div>
              <div><Label>Riot ID *</Label><Input name="riotId" value={form.riotId} onChange={handleChange} required placeholder="Ex: PlayerBR#1234" className="bg-secondary border-border" /></div>
              <div>
                <Label>Servidor</Label>
                <Select value={form.server} onValueChange={(v) => setForm({ ...form, server: v })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BR">Brasil</SelectItem>
                    <SelectItem value="LATAM">LATAM</SelectItem>
                    <SelectItem value="NA">América do Norte</SelectItem>
                    <SelectItem value="EU">Europa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Informações adicionais</Label><Textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Ex: melhor horário para receber, skin desejada..." className="bg-secondary border-border" /></div>
            </div>

            <div className="bg-card border border-primary/20 rounded-lg p-5 space-y-3">
              <h2 className="font-heading text-xl font-bold text-foreground uppercase">Pagamento</h2>
              <Select value={form.payment} onValueChange={(v) => setForm({ ...form, payment: v })}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX (recomendado)</SelectItem>
                  <SelectItem value="card">Cartão de crédito</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Após confirmação do pagamento, seu pedido entra em processamento.</p>
            </div>
          </div>

          <div className="bg-card border border-primary/30 rounded-lg p-6 h-fit sticky top-20">
            <h2 className="font-heading text-xl font-bold mb-4 uppercase">Resumo do Pedido</h2>
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm py-2 border-b border-border/30">
                <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                <span>{formatPrice((item.promoPrice ?? item.price) * item.quantity)}</span>
              </div>
            ))}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="neon-text">{formatPrice(total)}</span></div>
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-6 gradient-neon text-primary-foreground font-heading font-bold neon-glow hover:opacity-90 uppercase tracking-wider">
              {loading ? 'Processando...' : 'Confirmar Pedido'}
            </Button>
          </div>
        </form>
      </main>
      <StoreFooter />
    </div>
  );
};

export default Checkout;
