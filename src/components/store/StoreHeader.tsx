import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Gamepad2, ShieldCheck, Zap, Headphones } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const StoreHeader = () => {
  const { itemCount } = useCart();
  const { user, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="hidden md:block bg-foreground text-background">
        <div className="container mx-auto px-4 h-9 flex items-center justify-center gap-8 text-xs font-semibold">
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Compra segura</span>
          <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Entrega rápida</span>
          <span className="flex items-center gap-2"><Headphones className="h-4 w-4 text-primary" /> Suporte ao cliente</span>
        </div>
      </div>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md gradient-neon text-primary-foreground shadow-md">
            <Gamepad2 className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold text-foreground tracking-widest">VPEASY</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-heading uppercase tracking-wider">
          <Link to="/" className="text-foreground/70 hover:text-primary transition-colors">Início</Link>
          <Link to="/produtos" className="text-foreground/70 hover:text-primary transition-colors">Produtos</Link>
          <Link to="/avaliacoes" className="text-foreground/70 hover:text-primary transition-colors">Avaliações</Link>
          <Link to="/sobre" className="text-foreground/70 hover:text-primary transition-colors">Sobre</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/carrinho" className="relative p-2 rounded-md border border-border bg-card hover:border-primary/50 hover:bg-secondary transition-colors">
            <ShoppingCart className="h-5 w-5 text-foreground/80" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <Link to={isAdmin ? '/admin' : '/minha-conta'} className="p-2 rounded-md border border-border bg-card hover:border-primary/50 hover:bg-secondary transition-colors">
              <User className="h-5 w-5 text-foreground/80" />
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="border-primary/50 bg-card text-primary hover:bg-primary hover:text-primary-foreground">
                Entrar
              </Button>
            </Link>
          )}

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-card p-4 flex flex-col gap-3 font-heading uppercase tracking-wider shadow-lg">
          <Link to="/" onClick={() => setMobileOpen(false)} className="py-2">Início</Link>
          <Link to="/produtos" onClick={() => setMobileOpen(false)} className="py-2">Produtos</Link>
          <Link to="/avaliacoes" onClick={() => setMobileOpen(false)} className="py-2">Avaliações</Link>
          <Link to="/sobre" onClick={() => setMobileOpen(false)} className="py-2">Sobre</Link>
        </nav>
      )}
    </header>
  );
};

export default StoreHeader;
