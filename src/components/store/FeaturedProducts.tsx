import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from './ProductCard';

const FeaturedProducts = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setProducts(data);
      });
  }, []);

  return (
    <section className="my-12">
      <h2 className="font-heading text-3xl font-bold text-foreground mb-8">
        🔥 Produtos em <span className="neon-text">Destaque</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(p => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            slug={p.slug}
            price={p.price}
            promoPrice={p.promo_price}
            images={p.images || []}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
