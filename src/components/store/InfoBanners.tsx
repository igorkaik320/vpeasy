import { Truck, CreditCard, MapPin } from 'lucide-react';

const infoBanners = [
  { icon: Truck, text: 'Frete Grátis acima de R$299' },
  { icon: CreditCard, text: 'Parcele em até 12x' },
  { icon: MapPin, text: 'Entrega para todo Brasil' },
];

const InfoBanners = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
      {infoBanners.map(({ icon: Icon, text }) => (
        <div key={text} className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border/50 neon-border">
          <Icon className="h-6 w-6 text-primary flex-shrink-0" />
          <span className="font-heading font-semibold text-foreground text-sm">{text}</span>
        </div>
      ))}
    </div>
  );
};

export default InfoBanners;
