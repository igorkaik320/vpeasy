import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/store-utils';
import { Button } from '@/components/ui/button';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (!items.length) {
    return (
      <div className="min-h-screen bg-background">
        <StoreHeader />
        <main className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Carrinho Vazio</h2>
          <p className="text-muted-foreground mb-6">Adicione produtos para continuar</p>
          <Link to="/produtos">
            <Button className="gradient-neon text-primary-foreground font-heading">Ver Produtos</Button>
          </Link>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-8 uppercase tracking-wider">Seu <span className="neon-text">Carrinho</span></h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex gap-4 bg-card border border-primary/20 rounded-lg p-4">
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-md object-cover" />
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-foreground">{item.name}</h3>
                  <p className="neon-text font-bold">{formatPrice(item.promoPrice ?? item.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-secondary rounded"><Minus className="h-3 w-3" /></button>
                    <span className="text-sm font-bold px-2">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-secondary rounded"><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeItem(item.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
                  <span className="font-bold text-foreground">{formatPrice((item.promoPrice ?? item.price) * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-card border border-primary/30 rounded-lg p-6 h-fit sticky top-20">
            <h3 className="font-heading text-xl font-bold mb-4 uppercase">Resumo</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="neon-text">{formatPrice(total)}</span></div>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Produto digital • Entrega via presente no jogo
            </p>
            <Link to="/checkout">
              <Button className="w-full gradient-neon text-primary-foreground font-heading font-bold neon-glow hover:opacity-90 uppercase tracking-wider">
                Finalizar Compra
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
};

export default Cart;
