import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  orderId: string;
}

interface Message {
  id: string;
  sender_role: string;
  message: string;
  created_at: string;
}

const OrderChat = ({ orderId }: Props) => {
  const { user, isAdmin } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from('order_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data as any);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`order-msgs-${orderId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_messages', filter: `order_id=eq.${orderId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!text.trim() || !user) return;
    setLoading(true);
    const { error } = await supabase.from('order_messages').insert({
      order_id: orderId,
      sender_id: user.id,
      sender_role: isAdmin ? 'admin' : 'client',
      message: text.trim(),
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setText('');
  };

  return (
    <div className="bg-card border border-primary/20 rounded-lg p-4 flex flex-col h-[400px]">
      <h3 className="font-heading font-bold uppercase tracking-wider mb-3 text-foreground">Mensagens</h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {messages.length === 0 && <p className="text-sm text-muted-foreground text-center pt-8">Nenhuma mensagem ainda. Inicie a conversa.</p>}
        {messages.map(m => {
          const mine = (isAdmin && m.sender_role === 'admin') || (!isAdmin && m.sender_role === 'client');
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${mine ? 'gradient-neon text-primary-foreground' : 'bg-secondary text-foreground border border-border'}`}>
                <p className="whitespace-pre-wrap break-words">{m.message}</p>
                <p className={`text-[10px] mt-1 opacity-70`}>
                  {m.sender_role === 'admin' ? 'Vendedor' : 'Cliente'} • {new Date(m.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="mt-3 flex gap-2">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva sua mensagem..." className="bg-secondary border-border resize-none min-h-[44px]" rows={1} />
        <Button onClick={send} disabled={loading} className="gradient-neon text-primary-foreground"><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  );
};

export default OrderChat;
