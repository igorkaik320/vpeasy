import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice, getProductImage } from '@/lib/store-utils';
import { calculatePricing, formatGiftCombination } from '@/lib/pricing';

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  vp_required: '',
  promo_price: '',
  image_url: '',
  images_extra: '',
  planned_description: '',
  display_group: 'package_1',
  is_active: true,
  is_featured: false,
  category: '',
  product_type: 'standard',
  release_days: '',
};

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [walletBalance, setWalletBalance] = useState(0);
  const [marginPercent, setMarginPercent] = useState(35);

  const load = async () => {
    const [productsRes, walletRes, settingsRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('pricing_wallet').select('*').eq('id', true).maybeSingle(),
      supabase.from('store_settings').select('*').eq('key', 'default_margin_percent').maybeSingle(),
    ]);
    if (productsRes.data) setProducts(productsRes.data);
    if (walletRes.data) setWalletBalance(Number(walletRes.data.balance_cny || 0));
    if (settingsRes.data?.value) setMarginPercent(Number(settingsRes.data.value) || 35);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
  };

  const openEdit = (p: any) => {
    const images = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
    setEditing(p);
    setForm({
      name: p.name || '',
      slug: p.slug || '',
      description: p.description || '',
      vp_required: p.vp_required ? String(p.vp_required) : '',
      promo_price: p.promo_price ? String(p.promo_price) : '',
      image_url: images[0] || '',
      images_extra: images.slice(1).join('\n'),
      planned_description: p.planned_description || '',
      display_group: p.display_group || 'package_1',
      is_active: p.is_active,
      is_featured: p.is_featured,
      category: p.category || '',
      product_type: p.product_type || 'standard',
      release_days: p.release_days ? String(p.release_days) : '',
    });
    setOpen(true);
  };

  const pricing = useMemo(() => {
    const vp = Number(form.vp_required || 0);
    if (!vp) return null;
    return calculatePricing(vp, marginPercent, walletBalance);
  }, [form.vp_required, marginPercent, walletBalance]);

  const getImagesFromForm = () =>
    [form.image_url, ...form.images_extra.split('\n')]
      .map((image) => image.trim())
      .filter(Boolean);

  const handleSave = async () => {
    if (!form.name || !form.vp_required || !pricing) {
      toast.error('Informe nome e VP necessario.');
      return;
    }

    const data = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: form.description,
      vp_required: pricing.requestedVp,
      price: pricing.salePrice,
      promo_price: form.promo_price ? parseFloat(form.promo_price) : null,
      images: getImagesFromForm(),
      is_active: form.is_active,
      is_featured: form.is_featured,
      category: form.category || null,
      product_type: form.product_type,
      release_days: form.release_days ? parseInt(form.release_days, 10) : null,
      planned_description: form.planned_description || null,
      display_group: form.display_group || null,
      game_package_cny: pricing.gamePackage.cny,
      game_package_vp: pricing.gamePackage.vp,
      required_cny: pricing.requiredCny,
      wallet_used_cny: pricing.walletUsedCny,
      gift_card_total_cny: pricing.totalGiftCny,
      gift_card_combo: pricing.giftCards,
      real_cost: pricing.operationCost,
      profit: pricing.profit,
      margin_percent: pricing.marginPercent,
      leftover_cny: pricing.leftoverCny,
    };

    try {
      if (editing) {
        const { error } = await supabase.from('products').update(data).eq('id', editing.id);
        if (error) throw error;
        toast.success('Produto atualizado!');
      } else {
        const { error } = await supabase.from('products').insert(data);
        if (error) throw error;
        toast.success('Produto criado e precificado!');
      }
      setOpen(false);
      resetForm();
      load();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar produto');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este produto?')) return;
    await supabase.from('products').delete().eq('id', id);
    toast.success('Produto excluido');
    load();
  };

  const uploadProductImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Envie um arquivo de imagem.');
      return;
    }

    const extension = file.name.split('.').pop() || 'jpg';
    const safeName = (form.slug || form.name || 'produto').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const path = `${safeName || 'produto'}-${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
    if (error) {
      toast.error(error.message);
      return;
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    setForm((current) => ({ ...current, image_url: data.publicUrl }));
    toast.success('Imagem enviada!');
  };

  const imagePreview = form.image_url.trim();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Produtos</h1>
          <p className="text-sm text-muted-foreground mt-1">Saldo da carteira: <span className="font-bold text-primary">{walletBalance} CNY</span> | Margem padrao: <span className="font-bold text-primary">{marginPercent}%</span></p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-neon text-primary-foreground font-heading gap-2"><Plus className="h-4 w-4" /> Novo Produto</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-heading">{editing ? 'Editar' : 'Novo'} Produto</DialogTitle></DialogHeader>
            <div className="grid lg:grid-cols-[1fr_320px] gap-6 mt-4">
              <div className="space-y-4">
                <div><Label>Nome</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-secondary border-border" /></div>
                <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-gerado" className="bg-secondary border-border" /></div>
                <div><Label>Descricao</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-secondary border-border" /></div>

                <div className="grid grid-cols-2 gap-4">
                  <div><Label>VP necessario</Label><Input type="number" min="1" value={form.vp_required} onChange={e => setForm({ ...form, vp_required: e.target.value })} placeholder="Ex: 1290" className="bg-secondary border-border" /></div>
                  <div><Label>Preco promo opcional</Label><Input type="number" step="0.01" value={form.promo_price} onChange={e => setForm({ ...form, promo_price: e.target.value })} className="bg-secondary border-border" /></div>
                </div>

                <div className="grid md:grid-cols-[1fr_auto] gap-4 items-end">
                  <div>
                    <Label>Imagem principal</Label>
                    <Input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) uploadProductImage(file); }} className="bg-secondary border-border" />
                    <Label className="mt-3 block text-xs text-muted-foreground">URL atual ou externa</Label>
                    <Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className="bg-secondary border-border" />
                  </div>
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview do produto" className="h-24 w-24 rounded-md border border-border object-cover" />
                  )}
                </div>

                <div>
                  <Label>Imagens extras</Label>
                  <Textarea value={form.images_extra} onChange={e => setForm({ ...form, images_extra: e.target.value })} placeholder="Uma URL por linha" className="bg-secondary border-border" />
                </div>

                <div><Label>Categoria</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="bg-secondary border-border" /></div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Classe da vitrine</Label>
                    <Select value={form.display_group} onValueChange={(v) => setForm({ ...form, display_group: v })}>
                      <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="package_1">Pacote 1</SelectItem>
                        <SelectItem value="package_2">Pacote 2</SelectItem>
                        <SelectItem value="package_3">Pacote 3</SelectItem>
                        <SelectItem value="passes">Passes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tipo de produto</Label>
                    <Select value={form.product_type} onValueChange={(v) => setForm({ ...form, product_type: v })}>
                      <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Padrao</SelectItem>
                        <SelectItem value="package">Pacote</SelectItem>
                        <SelectItem value="passe_economico">Compra planejada</SelectItem>
                        <SelectItem value="skin_custom">Skin sob consulta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div><Label>Prazo padrao (dias)</Label><Input type="number" min="1" value={form.release_days} onChange={e => setForm({ ...form, release_days: e.target.value })} placeholder="Ex: 15" className="bg-secondary border-border" /></div>

                <div>
                  <Label>Texto da compra planejada</Label>
                  <Textarea value={form.planned_description} onChange={e => setForm({ ...form, planned_description: e.target.value })} placeholder="Ex: O passe economico nao cai na hora." className="bg-secondary border-border min-h-24" />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} /><Label>Ativo</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={v => setForm({ ...form, is_featured: v })} /><Label>Destaque</Label></div>
                </div>
              </div>

              <div className="bg-secondary/60 border border-border rounded-lg p-4 h-fit sticky top-2">
                <h3 className="font-heading font-bold uppercase mb-3">Precificacao automatica</h3>
                {pricing ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>VP informado</span><strong>{pricing.requestedVp} VP</strong></div>
                    <div className="flex justify-between"><span>Pacote do jogo</span><strong>{pricing.gamePackage.cny} CNY / {pricing.gamePackage.vp} VP</strong></div>
                    <div className="flex justify-between"><span>CNY necessario</span><strong>{pricing.requiredCny} CNY</strong></div>
                    <div className="flex justify-between"><span>Carteira usada</span><strong>{pricing.walletUsedCny} CNY</strong></div>
                    <div className="whitespace-pre-line rounded-md bg-card border border-border p-3">{formatGiftCombination(pricing.giftCards)}</div>
                    <div className="flex justify-between"><span>Total comprado</span><strong>{pricing.totalGiftCny} CNY</strong></div>
                    <div className="flex justify-between"><span>Sobra</span><strong>{pricing.leftoverCny} CNY</strong></div>
                    <div className="flex justify-between"><span>Custo real</span><strong>{formatPrice(pricing.operationCost)}</strong></div>
                    <div className="flex justify-between"><span>Margem</span><strong>{pricing.marginPercent}%</strong></div>
                    <div className="flex justify-between"><span>Lucro</span><strong>{formatPrice(pricing.profit)}</strong></div>
                    <div className="border-t border-border pt-2 flex justify-between text-base"><span>Preco final</span><strong className="text-primary">{formatPrice(pricing.salePrice)}</strong></div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Informe o VP necessario para calcular.</p>
                )}
                <Button onClick={handleSave} className="w-full mt-4 gradient-neon text-primary-foreground font-heading">Salvar produto</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-heading">Imagem</th>
              <th className="px-4 py-3 text-left font-heading">Nome</th>
              <th className="px-4 py-3 text-left font-heading">VP</th>
              <th className="px-4 py-3 text-left font-heading">Custo</th>
              <th className="px-4 py-3 text-left font-heading">Preco</th>
              <th className="px-4 py-3 text-left font-heading">Lucro</th>
              <th className="px-4 py-3 text-left font-heading">Status</th>
              <th className="px-4 py-3 text-right font-heading">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t border-border/30">
                <td className="px-4 py-3">
                  <img src={getProductImage(p.slug, p.images || [])} alt={p.name} className="h-12 w-12 rounded-md object-cover border border-border" />
                </td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.vp_required || '-'}</td>
                <td className="px-4 py-3">{formatPrice(Number(p.real_cost || 0))}</td>
                <td className="px-4 py-3 font-bold neon-text">{formatPrice(Number(p.promo_price || p.price || 0))}</td>
                <td className="px-4 py-3">{formatPrice(Number(p.profit || 0))}</td>
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
