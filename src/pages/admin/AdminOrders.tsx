import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice, STATUS_LABELS } from '@/lib/store-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import OrderChat from '@/components/store/OrderChat';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  const load = () => {
    supabase.from('orders').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setOrders(data); });
  };
  useEffect(load, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    await supabase.from('order_status_history').insert({ order_id: id, status });
    toast.success('Status atualizado!');
    load();
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  if (selected) {
    return (
      <div>
        <Button variant="ghost" onClick={() => setSelected(null)} className="mb-4"><ChevronLeft className="h-4 w-4 mr-1"/> Voltar</Button>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-primary/30 rounded-lg p-5">
              <h2 className="font-heading text-2xl font-bold uppercase mb-2">Pedido #{selected.id.slice(0,8)}</h2>
              <p className="text-sm text-muted-foreground">{new Date(selected.created_at).toLocaleString('pt-BR')}</p>
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <div><span className="text-muted-foreground">Cliente:</span> {selected.customer_name}</div>
                <div><span className="text-muted-foreground">Email:</span> {selected.customer_email}</div>
                <div><span className="text-muted-foreground">Telefone:</span> {selected.customer_phone || '—'}</div>
                <div><span className="text-muted-foreground">Nick:</span> {selected.game_nick || '—'}</div>
                <div><span className="text-muted-foreground">Riot ID:</span> {selected.riot_id || '—'}</div>
                <div><span className="text-muted-foreground">Servidor:</span> {selected.game_server || '—'}</div>
              </div>
              {selected.game_notes && <p className="text-sm mt-3 text-muted-foreground italic">"{selected.game_notes}"</p>}
              <div className="mt-4 space-y-2 border-t border-border/30 pt-3">
                {(selected.items as any[]).map((it, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{it.name} x{it.quantity}</span>
                    <span className="neon-text font-bold">{formatPrice(it.price * it.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 border-t border-border/30">
                  <span>Total</span>
                  <span className="neon-text">{formatPrice(selected.total)}</span>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-xs text-muted-foreground uppercase">Status</label>
                <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v)}>
                  <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div>
            <OrderChat orderId={selected.id} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-6 uppercase tracking-wider">Pedidos</h1>
      <div className="bg-card border border-primary/20 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-heading">Pedido</th>
              <th className="px-4 py-3 text-left font-heading">Cliente</th>
              <th className="px-4 py-3 text-left font-heading">Nick / Riot ID</th>
              <th className="px-4 py-3 text-left font-heading">Total</th>
              <th className="px-4 py-3 text-left font-heading">Data</th>
              <th className="px-4 py-3 text-left font-heading">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-t border-border/30 hover:bg-secondary/30">
                <td className="px-4 py-3 text-muted-foreground">#{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3">{o.customer_name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{o.game_nick} / {o.riot_id}</td>
                <td className="px-4 py-3 neon-text font-bold">{formatPrice(o.total)}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="border-primary/40 text-primary text-xs">{STATUS_LABELS[o.status] || o.status}</Badge></td>
                <td className="px-4 py-3"><Button size="sm" variant="outline" onClick={() => setSelected(o)}>Ver</Button></td>
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
