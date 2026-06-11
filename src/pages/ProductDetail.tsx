import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import { useCart } from '@/contexts/CartContext';
import { getProductImage, formatPrice } from '@/lib/store-utils';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    if (slug) {
      supabase.from('products').select('*').eq('slug', slug).single()
        .then(({ data }) => { if (data) setProduct(data); });
    }
  }, [slug]);

  if (!product) return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Carregando...</div>
    </div>
  );

  const image = getProductImage(product.slug, product.images || []);
  const discount = product.promo_price ? Math.round(((product.price - product.promo_price) / product.price) * 100) : 0;

  const isCustom = product.product_type === 'skin_custom' || product.price === 0;

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem({ id: product.id, name: product.name, price: product.price, promoPrice: product.promo_price, image, productType: product.product_type, releaseDays: product.release_days } as any);
    }
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="relative rounded-lg overflow-hidden bg-surface aspect-square">
            <img src={image} alt={product.name} className="w-full h-full object-cover" />
            {product.badge && (
              <span className="absolute top-4 left-4 gradient-neon text-primary-foreground font-bold px-3 py-1 rounded-md font-heading tracking-wider neon-glow">{product.badge}</span>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">{product.name}</h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>
            <div className="flex items-baseline gap-3 mb-6">
              {product.promo_price ? (
                <>
                  <span className="text-muted-foreground line-through text-lg">{formatPrice(product.price)}</span>
                  <span className="neon-text font-bold text-3xl">{formatPrice(product.promo_price)}</span>
                </>
              ) : (
                <span className="text-foreground font-bold text-3xl">{formatPrice(product.price)}</span>
              )}
            </div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-muted-foreground">Quantidade:</span>
              <div className="flex items-center gap-2 border border-border rounded-md">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-secondary"><Minus className="h-4 w-4" /></button>
                <span className="px-4 font-bold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="p-2 hover:bg-secondary"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
            <Button onClick={handleAdd} size="lg" className="gradient-neon text-primary-foreground font-heading font-bold text-lg gap-2 neon-glow hover:opacity-90">
              <ShoppingCart className="h-5 w-5" /> Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
};

export default ProductDetail;
