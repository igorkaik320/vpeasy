import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
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
}

const ProductCard = ({ id, name, slug, price, promoPrice, images }: ProductCardProps) => {
  const { addItem } = useCart();
  const image = getProductImage(slug, images);
  const discount = promoPrice ? Math.round(((price - promoPrice) / price) * 100) : 0;

  const handleAdd = () => {
    addItem({ id, name, price, promoPrice, image });
    toast.success(`${name} adicionado ao carrinho!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group rounded-lg bg-card border border-border/50 overflow-hidden hover:neon-border transition-all duration-300"
    >
      <Link to={`/produto/${slug}`} className="block relative aspect-square overflow-hidden bg-surface">
        <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {discount > 0 && (
          <span className="absolute top-3 left-3 gradient-neon text-primary-foreground text-xs font-bold px-2 py-1 rounded-md">
            -{discount}%
          </span>
        )}
      </Link>
      <div className="p-4">
        <Link to={`/produto/${slug}`}>
          <h3 className="font-heading font-bold text-foreground text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2 mb-3">
          {promoPrice ? (
            <>
              <span className="text-muted-foreground line-through text-sm">{formatPrice(price)}</span>
              <span className="neon-text font-bold text-xl">{formatPrice(promoPrice)}</span>
            </>
          ) : (
            <span className="text-foreground font-bold text-xl">{formatPrice(price)}</span>
          )}
        </div>
        <Button onClick={handleAdd} className="w-full gradient-neon text-primary-foreground font-heading font-semibold gap-2 hover:opacity-90">
          <ShoppingCart className="h-4 w-4" /> Adicionar
        </Button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
