import { Gift, ShieldCheck, Headphones, Activity } from 'lucide-react';

const infoBanners = [
  { icon: Gift, text: 'Entrega via presente' },
  { icon: ShieldCheck, text: 'Mais segurança para sua conta' },
  { icon: Headphones, text: 'Suporte rápido' },
  { icon: Activity, text: 'Acompanhamento do pedido' },
];

const InfoBanners = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
      {infoBanners.map(({ icon: Icon, text }) => (
        <div key={text} className="flex items-center gap-3 p-4 rounded-lg bg-card border border-primary/20 hover:border-primary/60 hover:neon-glow transition-all">
          <Icon className="h-6 w-6 text-primary flex-shrink-0" />
          <span className="font-heading font-semibold text-foreground text-sm">{text}</span>
        </div>
      ))}
    </div>
  );
};

export default InfoBanners;
