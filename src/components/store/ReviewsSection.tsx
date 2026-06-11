import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  customer_name: string;
  rating_service: number;
  rating_speed: number;
  rating_overall: number;
  comment: string | null;
  created_at: string;
}

export const ReviewStars = ({ value, size = 16 }: { value: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(n => (
      <Star key={n} size={size} className={n <= value ? 'fill-primary text-primary' : 'text-muted'} />
    ))}
  </div>
);

const ReviewsSection = ({ limit = 4 }: { limit?: number }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState(0);

  useEffect(() => {
    supabase.from('reviews').select('*').eq('is_approved', true).order('created_at', { ascending: false }).limit(limit)
      .then(({ data }) => {
        if (data) {
          setReviews(data as any);
          if (data.length > 0) {
            const total = data.reduce((s: number, r: any) => s + (r.rating_service + r.rating_speed + r.rating_overall) / 3, 0);
            setAvg(total / data.length);
          }
        }
      });
  }, [limit]);

  return (
    <section className="my-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
        <h2 className="font-heading text-3xl font-bold text-foreground uppercase tracking-wider">
          <span className="neon-text">Avaliações</span> dos Clientes
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-3">
            <ReviewStars value={Math.round(avg)} size={20} />
            <span className="font-display text-2xl neon-text font-bold">{avg.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({reviews.length} avaliações)</span>
          </div>
        )}
      </div>
      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm">Seja o primeiro a avaliar nossos serviços.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-card border border-primary/20 rounded-lg p-4 hover:border-primary/50 transition-colors">
              <ReviewStars value={Math.round((r.rating_service + r.rating_speed + r.rating_overall) / 3)} />
              {r.comment && <p className="text-sm text-foreground/90 mt-3 line-clamp-4">"{r.comment}"</p>}
              <p className="text-xs text-muted-foreground mt-3 font-heading">— {r.customer_name}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ReviewsSection;
