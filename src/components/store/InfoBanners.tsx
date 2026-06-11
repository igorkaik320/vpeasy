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
        <div key={text} className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border shadow-sm hover:border-primary/40 hover:shadow-md transition-all">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-primary/10">
            <Icon className="h-5 w-5 text-primary flex-shrink-0" />
          </span>
          <span className="font-heading font-semibold text-foreground text-sm">{text}</span>
        </div>
      ))}
    </div>
  );
};

export default InfoBanners;
