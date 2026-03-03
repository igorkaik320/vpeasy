import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AdminPages = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);

  const load = () => {
    supabase.from('pages').select('*').order('slug').then(({ data }) => { if (data) setPages(data); });
  };
  useEffect(load, []);

  const save = async () => {
    if (!editing) return;
    const { error } = await supabase.from('pages').update({ title: editing.title, content: editing.content }).eq('id', editing.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Página salva!');
    setEditing(null);
    load();
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-6">Páginas</h1>
      {editing ? (
        <div className="bg-card border border-border/50 rounded-lg p-6 space-y-4">
          <div><Label>Título</Label><Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className="bg-secondary border-border" /></div>
          <div><Label>Conteúdo</Label><Textarea value={editing.content || ''} onChange={e => setEditing({ ...editing, content: e.target.value })} rows={10} className="bg-secondary border-border" /></div>
          <div className="flex gap-2">
            <Button onClick={save} className="gradient-neon text-primary-foreground font-heading">Salvar</Button>
            <Button variant="outline" onClick={() => setEditing(null)} className="border-border">Cancelar</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map(p => (
            <div key={p.id} className="bg-card border border-border/50 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-heading font-bold">{p.title}</h3>
                <span className="text-xs text-muted-foreground">/{p.slug}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditing(p)} className="border-border">Editar</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPages;
