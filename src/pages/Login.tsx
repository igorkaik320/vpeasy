import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, name);
        toast.success('Conta criada! Verifique seu email.');
      } else {
        await signIn(email, password);
        toast.success('Login realizado!');
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border/50 rounded-lg p-8 neon-border">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Gamepad2 className="h-8 w-8 text-primary" />
          <span className="font-display text-xl font-bold neon-text tracking-wider">LEVELUP</span>
        </Link>
        <h1 className="font-heading text-2xl font-bold text-center mb-6">{isSignUp ? 'Criar Conta' : 'Entrar'}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div><Label>Nome completo</Label><Input value={name} onChange={e => setName(e.target.value)} className="bg-secondary border-border" /></div>
          )}
          <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-secondary border-border" /></div>
          <div><Label>Senha</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-secondary border-border" /></div>
          <Button type="submit" disabled={loading} className="w-full gradient-neon text-primary-foreground font-heading font-bold neon-glow">
            {loading ? 'Carregando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-4">
          {isSignUp ? 'Já tem conta?' : 'Não tem conta?'}{' '}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline">
            {isSignUp ? 'Entrar' : 'Criar conta'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
