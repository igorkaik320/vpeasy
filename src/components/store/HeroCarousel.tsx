import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getBannerImage } from '@/lib/store-utils';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link: string | null;
}

const defaultHeroBanner: Banner = {
  id: 'default-waylay-hero',
  title: 'Skins e Passes Valorant Mobile',
  subtitle: 'Garanta seus pacotes com atendimento seguro e entrega acompanhada pela VPEASY.',
  image_url: null,
  link: '/produtos',
};

const HeroCarousel = () => {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    supabase.from('banners')
      .select('*')
      .in('type', ['hero', 'carousel'])
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        setBanners(data?.length ? data : [defaultHeroBanner]);
      });
  }, []);

  const visibleBanners = banners.length ? banners : [defaultHeroBanner];

  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[Autoplay({ delay: 5000 })]}
      className="w-full"
    >
      <CarouselContent>
        {visibleBanners.map((banner) => (
          <CarouselItem key={banner.id}>
            <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-lg border border-border bg-card shadow-lg">
              <img
                src={getBannerImage(banner.title, banner.image_url)}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 to-white/10" />
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 max-w-2xl"
              >
                <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-3 leading-tight">
                  {banner.title}
                </h2>
                {banner.subtitle && (
                  <p className="text-muted-foreground text-lg md:text-xl mb-6">{banner.subtitle}</p>
                )}
                <Button asChild className="w-fit gradient-neon text-primary-foreground font-heading font-bold text-lg px-8 py-6 shadow-lg hover:opacity-90 transition-opacity uppercase tracking-wider">
                  <a href={banner.link || '/produtos'}>Ver Produtos</a>
                </Button>
              </motion.div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4 bg-card/90 border-border hover:bg-card shadow-md" />
      <CarouselNext className="right-4 bg-card/90 border-border hover:bg-card shadow-md" />
    </Carousel>
  );
};

export default HeroCarousel;
