import { useEffect, useState } from 'react';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Star } from 'lucide-react';
import { ReviewStars } from '@/components/store/ReviewsSection';
import { toast } from 'sonner';

const ReviewsPage = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', service: 5, speed: 5, overall: 5, comment: '' });
  const [loading, setLoading] = useState(false);

  const load = () => {
    supabase.from('reviews').select('*').eq('is_approved', true).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setReviews(data); });
  };
  useEffect(load, []);

  const submit = async () => {
    if (!form.name || !form.comment) { toast.error('Preencha nome e comentário'); return; }
    setLoading(true);
    const { error } = await supabase.from('reviews').insert({
      user_id: user?.id || null,
      customer_name: form.name,
      rating_service: form.service,
      rating_speed: form.speed,
      rating_overall: form.overall,
      comment: form.comment,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Avaliação enviada! Obrigado.');
    setForm({ name: '', service: 5, speed: 5, overall: 5, comment: '' });
    load();
  };

  const RatingPick = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div>
      <label className="text-sm text-muted-foreground">{label}</label>
      <div className="flex gap-1 mt-1">
        {[1,2,3,4,5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}>
            <Star className={`h-6 w-6 ${n <= value ? 'fill-primary text-primary' : 'text-muted'}`} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-heading text-3xl font-bold mb-8 uppercase tracking-wider"><span className="neon-text">Avaliações</span></h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 && <p className="text-muted-foreground">Nenhuma avaliação ainda.</p>}
            {reviews.map(r => (
              <div key={r.id} className="bg-card border border-primary/20 rounded-lg p-5">
                <div className="flex items-center justify-between">
                  <p className="font-heading font-bold">{r.customer_name}</p>
                  <ReviewStars value={Math.round((r.rating_service + r.rating_speed + r.rating_overall) / 3)} />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                  <div><span className="text-muted-foreground">Atendimento</span><ReviewStars value={r.rating_service} size={12} /></div>
                  <div><span className="text-muted-foreground">Velocidade</span><ReviewStars value={r.rating_speed} size={12} /></div>
                  <div><span className="text-muted-foreground">Geral</span><ReviewStars value={r.rating_overall} size={12} /></div>
                </div>
                {r.comment && <p className="text-sm mt-3 text-foreground/90">"{r.comment}"</p>}
                <p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-primary/30 rounded-lg p-5 h-fit space-y-4">
            <h2 className="font-heading text-xl font-bold uppercase">Deixe sua avaliação</h2>
            <Input placeholder="Seu nome" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="bg-secondary border-border" />
            <RatingPick label="Atendimento" value={form.service} onChange={(v) => setForm({...form, service: v})} />
            <RatingPick label="Velocidade" value={form.speed} onChange={(v) => setForm({...form, speed: v})} />
            <RatingPick label="Experiência geral" value={form.overall} onChange={(v) => setForm({...form, overall: v})} />
            <Textarea placeholder="Conte como foi sua experiência..." value={form.comment} onChange={(e) => setForm({...form, comment: e.target.value})} className="bg-secondary border-border" rows={4} />
            <Button onClick={submit} disabled={loading} className="w-full gradient-neon text-primary-foreground font-heading font-bold uppercase tracking-wider">
              {loading ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </div>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
};

export default ReviewsPage;
