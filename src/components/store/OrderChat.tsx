import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Paperclip, Send, X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  orderId: string;
  quickMessages?: string[];
}

interface Message {
  id: string;
  sender_role: string;
  message: string;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  created_at: string;
}

const OrderChat = ({ orderId, quickMessages = [] }: Props) => {
  const { user, isAdmin } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from('order_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data as Message[]);
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

  const uploadAttachment = async () => {
    if (!file) return {};
    const allowed = file.type.startsWith('image/') || file.type === 'application/pdf';
    if (!allowed) throw new Error('Envie imagem ou PDF.');

    const extension = file.name.split('.').pop() || 'file';
    const safeBase = file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40) || 'arquivo';
    const path = `${orderId}/${Date.now()}-${safeBase}.${extension}`;
    const { error } = await supabase.storage.from('order-attachments').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('order-attachments').getPublicUrl(path);

    return {
      attachment_url: data.publicUrl,
      attachment_name: file.name,
      attachment_type: file.type,
    };
  };

  const send = async () => {
    if ((!text.trim() && !file) || !user) return;
    setLoading(true);

    try {
      const attachment = await uploadAttachment();
      const { error } = await supabase.from('order_messages').insert({
        order_id: orderId,
        sender_id: user.id,
        sender_role: isAdmin ? 'admin' : 'client',
        message: text.trim() || file?.name || 'Anexo',
        ...attachment,
      });

      if (error) throw error;
      setText('');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const handleTextareaInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const el = event.currentTarget;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  };

  return (
    <div className="bg-card border border-primary/20 rounded-lg p-4 flex flex-col h-[560px]">
      <h3 className="font-heading font-bold uppercase tracking-wider mb-3 text-foreground">Mensagens</h3>

      {isAdmin && quickMessages.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {quickMessages.map((message, index) => (
            <Button key={index} type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => setText(message)}>
              Modelo {index + 1}
            </Button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {messages.length === 0 && <p className="text-sm text-muted-foreground text-center pt-8">Nenhuma mensagem ainda. Inicie a conversa.</p>}
        {messages.map(m => {
          const mine = (isAdmin && m.sender_role === 'admin') || (!isAdmin && m.sender_role === 'client');
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[82%] rounded-lg px-3 py-2 text-sm ${mine ? 'gradient-neon text-primary-foreground' : 'bg-secondary text-foreground border border-border'}`}>
                <p className="whitespace-pre-wrap break-words">{m.message}</p>
                {m.attachment_url && (
                  <div className="mt-2">
                    {m.attachment_type?.startsWith('image/') ? (
                      <a href={m.attachment_url} target="_blank" rel="noreferrer">
                        <img src={m.attachment_url} alt={m.attachment_name || 'Anexo'} className="max-h-48 rounded-md border border-white/20 object-cover" />
                      </a>
                    ) : (
                      <a href={m.attachment_url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 rounded-md px-3 py-2 ${mine ? 'bg-white/15 text-white' : 'bg-background text-foreground border border-border'}`}>
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate">{m.attachment_name || 'Abrir anexo'}</span>
                      </a>
                    )}
                  </div>
                )}
                <p className="text-[10px] mt-1 opacity-70">
                  {m.sender_role === 'admin' ? 'Vendedor' : 'Cliente'} - {new Date(m.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {file && (
        <div className="mt-3 flex items-center justify-between rounded-md border border-border bg-secondary px-3 py-2 text-xs">
          <span className="truncate">{file.name}</span>
          <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }} className="text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-3 flex gap-2 items-end">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={loading} className="h-12 px-3">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onInput={handleTextareaInput}
          placeholder="Escreva sua mensagem..."
          className="bg-secondary border-border min-h-24 max-h-44 resize-y leading-relaxed"
          rows={4}
        />
        <Button onClick={send} disabled={loading || (!text.trim() && !file)} className="gradient-neon text-primary-foreground h-12 px-4">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default OrderChat;
