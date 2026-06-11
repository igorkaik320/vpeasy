import ProductCard from './ProductCard';

export const PRODUCT_GROUPS = [
  { value: 'package_1', label: 'Pacote 1' },
  { value: 'package_2', label: 'Pacote 2' },
  { value: 'package_3', label: 'Pacote 3' },
  { value: 'passes', label: 'Passes' },
] as const;

interface ProductSectionsProps {
  products: any[];
  scroll?: boolean;
}

const ProductSections = ({ products, scroll = false }: ProductSectionsProps) => {
  return (
    <div className="space-y-10">
      {PRODUCT_GROUPS.map(group => {
        const groupedProducts = products.filter(product => product.display_group === group.value);
        if (!groupedProducts.length) return null;

        return (
          <section key={group.value}>
            <div className="mb-4 flex items-center gap-3">
              <h3 className="font-heading text-2xl font-bold uppercase tracking-wider text-foreground">{group.label}</h3>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className={scroll ? 'flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5'}>
              {groupedProducts.map(p => (
                <div key={p.id} className={scroll ? 'w-[250px] sm:w-[270px] lg:w-[285px] shrink-0 snap-start' : ''}>
                  <ProductCard
                    id={p.id}
                    name={p.name}
                    slug={p.slug}
                    price={p.price}
                    vpRequired={p.vp_required}
                    promoPrice={p.promo_price}
                    images={p.images || []}
                    badge={p.badge}
                    productType={p.product_type}
                    releaseDays={p.release_days}
                    plannedDescription={p.planned_description}
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default ProductSections;
