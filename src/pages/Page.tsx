import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';

const Page = () => {
  const location = useLocation();
  const slug = location.pathname.replace('/', '');
  const [page, setPage] = useState<any>(null);

  useEffect(() => {
    if (slug) {
      supabase.from('pages').select('*').eq('slug', slug).single()
        .then(({ data }) => { if (data) setPage(data); });
    }
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {page ? (
          <>
            <h1 className="font-heading text-4xl font-bold text-foreground mb-6">{page.title}</h1>
            <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{page.content}</div>
          </>
        ) : (
          <p className="text-muted-foreground">Carregando...</p>
        )}
      </main>
      <StoreFooter />
    </div>
  );
};

export default Page;
