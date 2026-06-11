import { motion } from 'framer-motion';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { getProductImage, formatPrice } from '@/lib/store-utils';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  promoPrice?: number | null;
  images: string[];
  badge?: string | null;
  productType?: string | null;
  releaseDays?: number | null;
}

const ProductCard = ({ id, name, slug, price, promoPrice, images, badge, productType, releaseDays }: ProductCardProps) => {
  const { addItem } = useCart();
  const image = getProductImage(slug, images);
  const isCustom = productType === 'skin_custom' || price === 0;

  const handleAdd = () => {
    addItem({ id, name, price, promoPrice, image, productType, releaseDays } as any);
    toast.success(`${name} adicionado ao carrinho!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group rounded-lg bg-card border border-primary/20 overflow-hidden hover:neon-border hover:neon-glow transition-all duration-300"
    >
      <Link to={`/produto/${slug}`} className="block relative aspect-square overflow-hidden bg-black">
        <img src={image} alt={name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {badge && (
          <span className="absolute top-3 left-3 gradient-neon text-primary-foreground text-xs font-bold px-3 py-1 rounded-md font-heading tracking-wider neon-glow">
            {badge}
          </span>
        )}
      </Link>
      <div className="p-4">
        <Link to={`/produto/${slug}`}>
          <h3 className="font-heading font-bold text-foreground text-lg mb-2 line-clamp-2 hover:text-primary transition-colors uppercase tracking-wide">
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
        <Button onClick={handleAdd} className="w-full gradient-neon text-primary-foreground font-heading font-semibold gap-2 hover:opacity-90 uppercase tracking-wider">
          <ShoppingCart className="h-4 w-4" /> {isCustom ? 'Solicitar' : 'Adicionar'}
        </Button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
