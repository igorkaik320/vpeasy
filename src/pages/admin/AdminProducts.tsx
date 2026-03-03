import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/store-utils';

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', price: '', promo_price: '', is_active: true, is_featured: false, category: '' });

  const load = () => {
    supabase.from('products').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setProducts(data); });
  };

  useEffect(load, []);

  const resetForm = () => {
    setForm({ name: '', slug: '', description: '', price: '', promo_price: '', is_active: true, is_featured: false, category: '' });
    setEditing(null);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, description: p.description || '',
      price: String(p.price), promo_price: p.promo_price ? String(p.promo_price) : '',
      is_active: p.is_active, is_featured: p.is_featured, category: p.category || ''
    });
    setOpen(true);
  };

  const handleSave = async () => {
    const data = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: form.description,
      price: parseFloat(form.price),
      promo_price: form.promo_price ? parseFloat(form.promo_price) : null,
      is_active: form.is_active,
      is_featured: form.is_featured,
      category: form.category || null,
    };

    if (editing) {
      const { error } = await supabase.from('products').update(data).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success('Produto atualizado!');
    } else {
      const { error } = await supabase.from('products').insert(data);
      if (error) { toast.error(error.message); return; }
      toast.success('Produto criado!');
    }
    setOpen(false);
    resetForm();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este produto?')) return;
    await supabase.from('products').delete().eq('id', id);
    toast.success('Produto excluído');
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl font-bold">Produtos</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-neon text-primary-foreground font-heading gap-2"><Plus className="h-4 w-4" /> Novo Produto</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-heading">{editing ? 'Editar' : 'Novo'} Produto</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Nome</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-secondary border-border" /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-gerado" className="bg-secondary border-border" /></div>
              <div><Label>Descrição</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-secondary border-border" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Preço (R$)</Label><Input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="bg-secondary border-border" /></div>
                <div><Label>Preço Promo (R$)</Label><Input type="number" step="0.01" value={form.promo_price} onChange={e => setForm({ ...form, promo_price: e.target.value })} className="bg-secondary border-border" /></div>
              </div>
              <div><Label>Categoria</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="bg-secondary border-border" /></div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} /><Label>Ativo</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={v => setForm({ ...form, is_featured: v })} /><Label>Destaque</Label></div>
              </div>
              <Button onClick={handleSave} className="w-full gradient-neon text-primary-foreground font-heading">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-heading">Nome</th>
              <th className="px-4 py-3 text-left font-heading">Preço</th>
              <th className="px-4 py-3 text-left font-heading">Status</th>
              <th className="px-4 py-3 text-right font-heading">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t border-border/30">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">
                  {p.promo_price ? <><span className="line-through text-muted-foreground mr-2">{formatPrice(p.price)}</span><span className="neon-text">{formatPrice(p.promo_price)}</span></> : formatPrice(p.price)}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${p.is_active ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>
                    {p.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(p)} className="p-1 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1 hover:text-destructive ml-2"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
