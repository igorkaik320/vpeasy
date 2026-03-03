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
import { toast } from 'sonner';

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const shipping = total >= 299 ? 0 : 29.90;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', street: '', city: '', state: '', zip: '', complement: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    setLoading(true);
    try {
      const orderItems = items.map(i => ({
        product_id: i.id, name: i.name, price: i.promoPrice ?? i.price, quantity: i.quantity, image: i.image
      }));

      const { error } = await supabase.from('orders').insert({
        user_id: user?.id || null,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        address_street: form.street,
        address_city: form.city,
        address_state: form.state,
        address_zip: form.zip,
        address_complement: form.complement,
        items: orderItems,
        subtotal: total,
        shipping,
        total: total + shipping,
        status: 'pending'
      });

      if (error) throw error;
      clearCart();
      toast.success('Pedido realizado com sucesso!');
      navigate(user ? '/minha-conta' : '/');
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
        <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Checkout</h1>
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-bold text-foreground">Dados Pessoais</h2>
            <div><Label>Nome completo *</Label><Input name="name" value={form.name} onChange={handleChange} required className="bg-secondary border-border" /></div>
            <div><Label>Email *</Label><Input name="email" type="email" value={form.email} onChange={handleChange} required className="bg-secondary border-border" /></div>
            <div><Label>Telefone</Label><Input name="phone" value={form.phone} onChange={handleChange} className="bg-secondary border-border" /></div>

            <h2 className="font-heading text-xl font-bold text-foreground pt-4">Endereço</h2>
            <div><Label>Rua</Label><Input name="street" value={form.street} onChange={handleChange} className="bg-secondary border-border" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Cidade</Label><Input name="city" value={form.city} onChange={handleChange} className="bg-secondary border-border" /></div>
              <div><Label>Estado</Label><Input name="state" value={form.state} onChange={handleChange} className="bg-secondary border-border" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>CEP</Label><Input name="zip" value={form.zip} onChange={handleChange} className="bg-secondary border-border" /></div>
              <div><Label>Complemento</Label><Input name="complement" value={form.complement} onChange={handleChange} className="bg-secondary border-border" /></div>
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-lg p-6 h-fit sticky top-20">
            <h2 className="font-heading text-xl font-bold mb-4">Resumo do Pedido</h2>
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm py-2 border-b border-border/30">
                <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                <span>{formatPrice((item.promoPrice ?? item.price) * item.quantity)}</span>
              </div>
            ))}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Frete</span><span>{shipping === 0 ? <span className="neon-text">Grátis</span> : formatPrice(shipping)}</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="neon-text">{formatPrice(total + shipping)}</span></div>
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-6 gradient-neon text-primary-foreground font-heading font-bold neon-glow hover:opacity-90">
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
