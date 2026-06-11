import { useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Package, Image, FileText, ShoppingBag, LogOut, Crosshair, Settings, MessageSquare, Star, Calculator } from 'lucide-react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/produtos', icon: Package, label: 'Produtos' },
  { to: '/admin/banners', icon: Image, label: 'Banners' },
  { to: '/admin/pedidos', icon: ShoppingBag, label: 'Pedidos' },
  { to: '/admin/mensagens', icon: MessageSquare, label: 'Mensagens' },
  { to: '/admin/precificacao', icon: Calculator, label: 'Precificacao' },
  { to: '/admin/avaliacoes', icon: Star, label: 'Avaliacoes' },
  { to: '/admin/paginas', icon: FileText, label: 'Paginas' },
  { to: '/admin/configuracoes', icon: Settings, label: 'Configuracoes' },
];

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('/login');
  }, [user, isAdmin, loading]);

  if (loading || !user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border/50 flex flex-col sticky top-0 h-screen">
        <div className="p-4 border-b border-border/50 flex items-center gap-2">
          <Crosshair className="h-6 w-6 text-primary" />
          <span className="font-display text-sm font-bold neon-text tracking-widest">ADMIN</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-heading transition-colors ${
                location.pathname === to ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border/50">
          <button onClick={() => { signOut(); navigate('/'); }} className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-destructive w-full font-heading">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
