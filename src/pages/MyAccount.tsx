import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/store-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Aguardando Pagamento', variant: 'outline' },
  paid: { label: 'Pago', variant: 'default' },
  shipped: { label: 'Enviado', variant: 'secondary' },
  delivered: { label: 'Entregue', variant: 'default' },
};

const MyAccount = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        .then(({ data }) => { if (data) setOrders(data); });
    }
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl font-bold">Minha <span className="neon-text">Conta</span></h1>
          <Button variant="outline" onClick={() => { signOut(); navigate('/'); }} className="border-border">Sair</Button>
        </div>

        <h2 className="font-heading text-xl font-bold mb-4">Meus Pedidos</h2>
        {orders.length === 0 ? (
          <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const st = statusMap[order.status] || { label: order.status, variant: 'outline' as const };
              return (
                <div key={order.id} className="bg-card border border-border/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Pedido #{order.id.slice(0, 8)}</span>
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                    <span className="font-bold neon-text">{formatPrice(order.total)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <StoreFooter />
    </div>
  );
};

export default MyAccount;
