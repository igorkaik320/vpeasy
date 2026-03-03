import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/store-utils';
import { Package, ShoppingBag, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0 });

  useEffect(() => {
    const load = async () => {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from('orders').select('total'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
      ]);
      const orders = ordersRes.data || [];
      setStats({
        orders: orders.length,
        revenue: orders.reduce((s, o) => s + Number(o.total), 0),
        products: productsRes.count || 0,
      });
    };
    load();
  }, []);

  const cards = [
    { icon: ShoppingBag, label: 'Total de Pedidos', value: stats.orders, color: 'text-primary' },
    { icon: DollarSign, label: 'Faturamento', value: formatPrice(stats.revenue), color: 'neon-text' },
    { icon: Package, label: 'Produtos Cadastrados', value: stats.products, color: 'text-primary' },
  ];

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-card border border-border/50 rounded-lg p-6 neon-border">
            <div className="flex items-center gap-3 mb-2">
              <Icon className={`h-5 w-5 ${color}`} />
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <span className={`text-3xl font-bold font-heading ${color}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
