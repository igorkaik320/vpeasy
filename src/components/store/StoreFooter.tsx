import { Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const StoreFooter = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50 mt-16">
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Gamepad2 className="h-6 w-6 text-primary" />
            <span className="font-display text-sm font-bold neon-text tracking-wider">LEVELUP STORE</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Sua loja gamer número 1 do Brasil. Os melhores periféricos e acessórios para o seu setup.
          </p>
        </div>
        <div>
          <h4 className="font-heading text-lg font-bold mb-4 text-foreground">Links</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/sobre" className="text-muted-foreground hover:text-primary transition-colors">Sobre Nós</Link>
            <Link to="/termos" className="text-muted-foreground hover:text-primary transition-colors">Termos de Uso</Link>
            <Link to="/politica" className="text-muted-foreground hover:text-primary transition-colors">Política de Privacidade</Link>
          </div>
        </div>
        <div>
          <h4 className="font-heading text-lg font-bold mb-4 text-foreground">Contato</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>contato@levelupstore.com</span>
            <span>(11) 99999-9999</span>
            <span>@levelupstore</span>
          </div>
        </div>
      </div>
      <div className="border-t border-border/30 py-4 text-center text-xs text-muted-foreground">
        © 2026 LevelUp Store. Todos os direitos reservados.
      </div>
    </footer>
  );
};

export default StoreFooter;
