import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Building2 } from 'lucide-react';
import logoVM from "@/assets/logo-vm-3x1-sb.png";

const Auth = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, senha);

    if (success) {
      toast({
        title: "Login realizado",
        description: "Bem-vindo ao sistema!",
      });
      navigate('/');
    } else {
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos.",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src={logoVM} alt="VM Gestão Estratégica" className="h-16 object-contain" />
          </div>
          <div>
            <CardTitle className="text-3xl">VM Gestão Estratégica</CardTitle>
            <CardDescription className="mt-2">
              Sistema de Gestão de Clientes
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="joao@vmgestao.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
            <div className="mt-4 p-3 bg-muted rounded-lg text-sm space-y-3">
              <p className="font-medium">Credenciais de teste:</p>
              <div className="space-y-1">
                <p className="text-xs font-medium text-primary">Supervisor (acesso total):</p>
                <p className="text-muted-foreground text-xs">joao@vmgestao.com.br / 123456</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-primary">Colaborador (acesso limitado):</p>
                <p className="text-muted-foreground text-xs">maria@vmgestao.com.br / 123456</p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
