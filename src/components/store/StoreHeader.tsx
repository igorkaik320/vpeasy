import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Gamepad2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const StoreHeader = () => {
  const { itemCount } = useCart();
  const { user, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Gamepad2 className="h-7 w-7 text-primary" />
          <span className="font-display text-lg font-bold neon-text tracking-wider">LEVELUP</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-heading">
          <Link to="/" className="text-foreground/80 hover:text-primary transition-colors">Início</Link>
          <Link to="/produtos" className="text-foreground/80 hover:text-primary transition-colors">Produtos</Link>
          <Link to="/sobre" className="text-foreground/80 hover:text-primary transition-colors">Sobre</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/carrinho" className="relative p-2 rounded-md hover:bg-secondary transition-colors">
            <ShoppingCart className="h-5 w-5 text-foreground/80" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <Link to={isAdmin ? '/admin' : '/minha-conta'} className="p-2 rounded-md hover:bg-secondary transition-colors">
              <User className="h-5 w-5 text-foreground/80" />
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
                Entrar
              </Button>
            </Link>
          )}

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border/50 bg-card p-4 flex flex-col gap-3 font-heading">
          <Link to="/" onClick={() => setMobileOpen(false)} className="py-2 text-foreground/80 hover:text-primary">Início</Link>
          <Link to="/produtos" onClick={() => setMobileOpen(false)} className="py-2 text-foreground/80 hover:text-primary">Produtos</Link>
          <Link to="/sobre" onClick={() => setMobileOpen(false)} className="py-2 text-foreground/80 hover:text-primary">Sobre</Link>
        </nav>
      )}
    </header>
  );
};

export default StoreHeader;
