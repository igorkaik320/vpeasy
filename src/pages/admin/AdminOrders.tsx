import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/store-utils';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const statusOptions = [
  { value: 'pending', label: 'Aguardando Pagamento' },
  { value: 'paid', label: 'Pago' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);

  const load = () => {
    supabase.from('orders').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setOrders(data); });
  };
  useEffect(load, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Status atualizado!');
    load();
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-6">Pedidos</h1>
      <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-heading">Pedido</th>
              <th className="px-4 py-3 text-left font-heading">Cliente</th>
              <th className="px-4 py-3 text-left font-heading">Total</th>
              <th className="px-4 py-3 text-left font-heading">Data</th>
              <th className="px-4 py-3 text-left font-heading">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-t border-border/30">
                <td className="px-4 py-3 text-muted-foreground">#{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3">{o.customer_name}</td>
                <td className="px-4 py-3 neon-text font-bold">{formatPrice(o.total)}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-3">
                  <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                    <SelectTrigger className="w-48 bg-secondary border-border text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-8 text-center text-muted-foreground">Nenhum pedido encontrado.</p>}
      </div>
    </div>
  );
};

export default AdminOrders;
