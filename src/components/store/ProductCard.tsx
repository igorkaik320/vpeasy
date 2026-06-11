import { motion } from 'framer-motion';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { getProductImage, formatPrice, getPlannedProductText, isPlannedProduct } from '@/lib/store-utils';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  vpRequired?: number | null;
  promoPrice?: number | null;
  images: string[];
  badge?: string | null;
  productType?: string | null;
  releaseDays?: number | null;
  plannedDescription?: string | null;
}

const ProductCard = ({ id, name, slug, price, vpRequired, promoPrice, images, badge, productType, releaseDays, plannedDescription }: ProductCardProps) => {
  const { addItem } = useCart();
  const image = getProductImage(slug, images);
  const isCustom = productType === 'skin_custom' || price === 0;
  const planned = isPlannedProduct(productType, releaseDays, slug);

  const handleAdd = () => {
    addItem({ id, name, slug, price, vpRequired, promoPrice, image, productType, releaseDays, plannedDescription } as any);
    toast.success(`${name} adicionado ao carrinho!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group h-full rounded-lg bg-card border border-border overflow-hidden shadow-sm hover:border-primary/30 hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <Link to={`/produto/${slug}`} className="block relative aspect-[16/9] overflow-hidden bg-secondary">
        <img src={image} alt={name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {badge && (
          <span className="absolute top-3 left-3 gradient-neon text-primary-foreground text-xs font-bold px-3 py-1 rounded-md font-heading tracking-wider shadow-md">
            {badge}
          </span>
        )}
      </Link>
      <div className="p-4 flex flex-1 flex-col">
        <Link to={`/produto/${slug}`}>
          <h3 className="font-heading font-bold text-foreground text-base mb-2 line-clamp-2 hover:text-primary transition-colors uppercase tracking-wide min-h-[48px]">
            {name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2 mb-3 min-h-[28px]">
          {isCustom ? (
            <span className="purple-text font-bold text-lg flex items-center gap-1"><Sparkles className="h-4 w-4" /> Sob consulta</span>
          ) : promoPrice ? (
            <>
              <span className="text-muted-foreground line-through text-sm">{formatPrice(price)}</span>
              <span className="neon-text font-bold text-xl">{formatPrice(promoPrice)}</span>
            </>
          ) : (
            <span className="neon-text font-bold text-xl">{formatPrice(price)}</span>
          )}
        </div>
        {vpRequired ? <p className="mb-3 text-xs font-semibold text-muted-foreground">{vpRequired} VP</p> : null}
        {planned && (
          <p className="mb-3 rounded-md bg-accent/5 px-3 py-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {getPlannedProductText(releaseDays, plannedDescription)}
          </p>
        )}
        <div className="mt-auto">
        <Button onClick={handleAdd} className="w-full gradient-neon text-primary-foreground font-heading font-semibold gap-2 shadow-md hover:opacity-90 uppercase tracking-wider">
          <ShoppingCart className="h-4 w-4" /> {isCustom ? 'Solicitar' : 'Adicionar'}
        </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
