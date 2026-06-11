import productPasseEco from '@/assets/product-passe-eco.jpg';
import productPasseInst from '@/assets/product-passe-inst.jpg';
import productSkin1290 from '@/assets/product-skin-1290.jpg';
import productSkin1560 from '@/assets/product-skin-1560.jpg';
import productSkin1980 from '@/assets/product-skin-1980.jpg';
import productSkinCustom from '@/assets/product-skin-custom.jpg';
import bannerValorant from '@/assets/banner-valorant.jpg';

export const PRODUCT_IMAGES: Record<string, string> = {
  'passe-economico': productPasseEco,
  'passe-instantaneo': productPasseInst,
  'skin-1290': productSkin1290,
  'skin-1560': productSkin1560,
  'skin-1980': productSkin1980,
  'skin-personalizada': productSkinCustom,
};

export const BANNER_IMAGES: Record<string, string> = {
  'Compre Skins e Passes com Mais Segurança': bannerValorant,
};

const isResolvable = (src: string | null | undefined) =>
  !!src && (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:'));

export const getProductImage = (slug: string, images: string[]) => {
  if (images && images.length > 0 && isResolvable(images[0])) return images[0];
  return PRODUCT_IMAGES[slug] || productPasseEco;
};

export const getBannerImage = (title: string, imageUrl: string | null) => {
  if (isResolvable(imageUrl)) return imageUrl!;
  return BANNER_IMAGES[title] || bannerValorant;
};

export const formatPrice = (price: number) => {
  if (price === 0) return 'Sob consulta';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Aguardando Pagamento',
  paid: 'Pagamento Confirmado',
  awaiting_info: 'Aguardando Informações',
  processing: 'Em Processamento',
  awaiting_release: 'Aguardando Liberação',
  ready: 'Pronto para Receber',
  delivered: 'Entregue',
};

export const STATUS_ORDER = ['pending','paid','awaiting_info','processing','awaiting_release','ready','delivered'];
