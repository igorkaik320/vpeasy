import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import ProductSections from '@/components/store/ProductSections';

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setProducts(data); });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-8">Todos os <span className="neon-text">Produtos</span></h1>
        <ProductSections products={products} />
      </main>
      <StoreFooter />
    </div>
  );
};

export default Products;
