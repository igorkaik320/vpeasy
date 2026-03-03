import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminBanners = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', subtitle: '', link: '', type: 'carousel', sort_order: '0', is_active: true, image_url: '' });

  const load = () => {
    supabase.from('banners').select('*').order('sort_order')
      .then(({ data }) => { if (data) setBanners(data); });
  };
  useEffect(load, []);

  const resetForm = () => { setForm({ title: '', subtitle: '', link: '', type: 'carousel', sort_order: '0', is_active: true, image_url: '' }); setEditing(null); };

  const openEdit = (b: any) => {
    setEditing(b);
    setForm({ title: b.title, subtitle: b.subtitle || '', link: b.link || '', type: b.type, sort_order: String(b.sort_order), is_active: b.is_active, image_url: b.image_url || '' });
    setOpen(true);
  };

  const handleSave = async () => {
    const data = { title: form.title, subtitle: form.subtitle || null, link: form.link || null, type: form.type, sort_order: parseInt(form.sort_order), is_active: form.is_active, image_url: form.image_url || null };
    if (editing) {
      const { error } = await supabase.from('banners').update(data).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success('Banner atualizado!');
    } else {
      const { error } = await supabase.from('banners').insert(data);
      if (error) { toast.error(error.message); return; }
      toast.success('Banner criado!');
    }
    setOpen(false); resetForm(); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este banner?')) return;
    await supabase.from('banners').delete().eq('id', id);
    toast.success('Banner excluído'); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl font-bold">Banners</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button className="gradient-neon text-primary-foreground font-heading gap-2"><Plus className="h-4 w-4" /> Novo Banner</Button></DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="font-heading">{editing ? 'Editar' : 'Novo'} Banner</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Título</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-secondary border-border" /></div>
              <div><Label>Subtítulo</Label><Input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="bg-secondary border-border" /></div>
              <div><Label>URL da Imagem</Label><Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="bg-secondary border-border" /></div>
              <div><Label>Link</Label><Input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} className="bg-secondary border-border" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Tipo</Label>
                  <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="carousel">Carrossel</SelectItem><SelectItem value="fixed">Fixo</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Ordem</Label><Input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} className="bg-secondary border-border" /></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} /><Label>Ativo</Label></div>
              <Button onClick={handleSave} className="w-full gradient-neon text-primary-foreground font-heading">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary"><tr><th className="px-4 py-3 text-left font-heading">Título</th><th className="px-4 py-3 text-left font-heading">Tipo</th><th className="px-4 py-3 text-left font-heading">Ordem</th><th className="px-4 py-3 text-right font-heading">Ações</th></tr></thead>
          <tbody>
            {banners.map(b => (
              <tr key={b.id} className="border-t border-border/30">
                <td className="px-4 py-3">{b.title}</td>
                <td className="px-4 py-3 capitalize">{b.type === 'carousel' ? 'Carrossel' : 'Fixo'}</td>
                <td className="px-4 py-3">{b.sort_order}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(b)} className="p-1 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(b.id)} className="p-1 hover:text-destructive ml-2"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBanners;
