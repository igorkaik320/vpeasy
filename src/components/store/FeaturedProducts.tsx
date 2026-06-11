import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProductSections from './ProductSections';

const FeaturedProducts = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('products')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('price', { ascending: true })
      .then(({ data }) => {
        if (data) setProducts(data);
      });
  }, []);

  if (!products.length) return null;

  return (
    <section className="my-12">
      <h2 className="font-heading text-3xl font-bold text-foreground mb-8 uppercase tracking-wider">
        Produtos em <span className="neon-text">Destaque</span>
      </h2>
      <ProductSections products={products} scroll />
    </section>
  );
};

export default FeaturedProducts;
