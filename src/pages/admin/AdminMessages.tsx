import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import OrderChat from '@/components/store/OrderChat';
import { ChevronLeft, MessageSquare } from 'lucide-react';

const AdminMessages = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    supabase.from('orders').select('id, customer_name, game_nick, status, created_at').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setOrders(data); });
  }, []);

  if (selected) {
    return (
      <div>
        <Button variant="ghost" onClick={() => setSelected(null)} className="mb-4"><ChevronLeft className="h-4 w-4 mr-1"/> Voltar</Button>
        <h2 className="font-heading text-xl font-bold mb-3">Conversa — Pedido #{selected.id.slice(0,8)} • {selected.customer_name}</h2>
        <OrderChat orderId={selected.id} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-6 uppercase tracking-wider">Mensagens</h1>
      <div className="space-y-2">
        {orders.map(o => (
          <button key={o.id} onClick={() => setSelected(o)} className="w-full text-left bg-card border border-primary/20 hover:border-primary/60 rounded-lg p-3 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-primary" />
              <div>
                <p className="font-heading font-bold text-sm">{o.customer_name} <span className="text-muted-foreground font-normal">/ {o.game_nick || '—'}</span></p>
                <p className="text-xs text-muted-foreground">#{o.id.slice(0,8)} • {new Date(o.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            <span className="text-xs text-primary">Abrir →</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminMessages;
