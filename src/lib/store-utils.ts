import { supabase } from '@/integrations/supabase/client';

// Static fallback images for products (used when no DB image)
import productKeyboard from '@/assets/product-keyboard.jpg';
import productMouse from '@/assets/product-mouse.jpg';
import productHeadset from '@/assets/product-headset.jpg';
import productChair from '@/assets/product-chair.jpg';
import bannerSetup from '@/assets/banner-setup.jpg';
import bannerKeyboard from '@/assets/banner-keyboard.jpg';
import bannerHeadset from '@/assets/banner-headset.jpg';

export const PRODUCT_IMAGES: Record<string, string> = {
  'teclado-mecanico-rgb-gamer': productKeyboard,
  'mouse-gamer-7200-dpi': productMouse,
  'headset-gamer-surround-71': productHeadset,
  'cadeira-gamer-ergonomica': productChair,
};

export const BANNER_IMAGES: Record<string, string> = {
  'Setup Gamer dos Sonhos': bannerSetup,
  'Teclados Mecânicos com 30% OFF': bannerKeyboard,
  'Headsets RGB Profissionais': bannerHeadset,
};

export const getProductImage = (slug: string, images: string[]) => {
  if (images && images.length > 0 && images[0]) return images[0];
  return PRODUCT_IMAGES[slug] || productKeyboard;
};

export const getBannerImage = (title: string, imageUrl: string | null) => {
  if (imageUrl) return imageUrl;
  return BANNER_IMAGES[title] || bannerSetup;
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
};
