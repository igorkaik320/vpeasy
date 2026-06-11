import productPasseEco from '@/assets/product-passe-eco.jpg';
import productPasseInst from '@/assets/product-passe-inst.jpg';
import productSkin1290 from '@/assets/product-skin-1290.jpg';
import productSkin1560 from '@/assets/product-skin-1560.jpg';
import productSkin1980 from '@/assets/product-skin-1980.jpg';
import productSkinCustom from '@/assets/product-skin-custom.jpg';
import bannerValorant from '@/assets/banner-waylay-valorant.png';

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
  awaiting_seller: 'Aguardando Vendedor',
  pending: 'Aguardando Pagamento',
  paid: 'Pagamento Confirmado',
  approved: 'Aprovado',
  awaiting_info: 'Aguardando Informações',
  processing: 'Em Processamento',
  awaiting_release: 'Aguardando Liberação',
  ready: 'Pronto para Receber',
  delivered: 'Entregue',
};

export const STATUS_ORDER = ['awaiting_seller','pending','paid','approved','awaiting_info','processing','awaiting_release','ready','delivered'];

export const isPlannedProduct = (productType?: string | null, releaseDays?: number | null, nameOrSlug?: string | null) => {
  const normalized = (nameOrSlug || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return productType === 'passe_economico' || Number(releaseDays || 0) > 0 || normalized.includes('passe-economico') || normalized.includes('passe economico');
};

export const getPlannedProductText = (releaseDays?: number | null, customText?: string | null) => {
  if (customText?.trim()) return customText.trim();
  const days = Number(releaseDays || 15);
  return `Compra planejada: este produto nao cai na hora. O prazo padrao e de ${days} dias apos confirmacao e inicio do processo pelo vendedor.`;
};
