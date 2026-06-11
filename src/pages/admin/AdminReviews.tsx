import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReviewStars } from '@/components/store/ReviewsSection';
import { toast } from 'sonner';

const AdminReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);

  const load = () => {
    supabase.from('reviews').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setReviews(data); });
  };
  useEffect(load, []);

  const toggle = async (id: string, is_approved: boolean) => {
    const { error } = await supabase.from('reviews').update({ is_approved }).eq('id', id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir avaliação?')) return;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-6 uppercase tracking-wider">Avaliações</h1>
      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className="bg-card border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-heading font-bold">{r.customer_name}</span>
                <ReviewStars value={Math.round((r.rating_service + r.rating_speed + r.rating_overall) / 3)} />
                <Badge variant={r.is_approved ? 'default' : 'outline'}>{r.is_approved ? 'Aprovada' : 'Oculta'}</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toggle(r.id, !r.is_approved)}>{r.is_approved ? 'Ocultar' : 'Aprovar'}</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(r.id)}>Excluir</Button>
              </div>
            </div>
            {r.comment && <p className="text-sm text-foreground/90">"{r.comment}"</p>}
            <p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleString('pt-BR')}</p>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-muted-foreground">Nenhuma avaliação.</p>}
      </div>
    </div>
  );
};

export default AdminReviews;
