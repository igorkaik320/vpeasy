import { Crosshair } from 'lucide-react';
import { Link } from 'react-router-dom';

const StoreFooter = () => {
  return (
    <footer className="border-t border-primary/20 bg-card/40 mt-16">
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Crosshair className="h-6 w-6 text-primary" />
            <span className="font-display text-sm font-bold neon-text tracking-widest">VP STORE BRASIL</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Presentes, Passe de Batalha e Skins para Valorant Mobile com entrega segura via sistema de presentes do jogo.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-3">
            Loja independente. Não afiliada à Riot Games.
          </p>
        </div>
        <div>
          <h4 className="font-heading text-lg font-bold mb-4 text-foreground uppercase tracking-wider">Links</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/sobre" className="text-muted-foreground hover:text-primary transition-colors">Sobre Nós</Link>
            <Link to="/avaliacoes" className="text-muted-foreground hover:text-primary transition-colors">Avaliações</Link>
            <Link to="/termos" className="text-muted-foreground hover:text-primary transition-colors">Termos de Uso</Link>
            <Link to="/politica" className="text-muted-foreground hover:text-primary transition-colors">Política de Privacidade</Link>
          </div>
        </div>
        <div>
          <h4 className="font-heading text-lg font-bold mb-4 text-foreground uppercase tracking-wider">Contato</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>contato@vpstorebrasil.com</span>
            <span>Suporte: 24h</span>
            <span>@vpstorebrasil</span>
          </div>
        </div>
      </div>
      <div className="border-t border-border/30 py-4 text-center text-xs text-muted-foreground">
        © 2026 VP Store Brasil. Todos os direitos reservados.
      </div>
    </footer>
  );
};

export default StoreFooter;
