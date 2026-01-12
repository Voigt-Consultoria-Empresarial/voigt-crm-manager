import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, LogOut, Eye, EyeOff, Save, X, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Mock de usuários para gestão de acesso
const USUARIOS_MOCK = [
  { id: 'func-001', nome: 'João Silva', email: 'joao@voigt.com.br', cargo: 'Advogado Sênior', nivelAcesso: 'supervisor' },
  { id: 'func-002', nome: 'Maria Santos', email: 'maria@voigt.com.br', cargo: 'Advogada Tributarista', nivelAcesso: 'colaborador' },
  { id: 'func-003', nome: 'Carlos Oliveira', email: 'carlos@voigt.com.br', cargo: 'Estagiário', nivelAcesso: 'visualizador' },
  { id: 'func-004', nome: 'Ana Costa', email: 'ana@voigt.com.br', cargo: 'Advogada', nivelAcesso: 'colaborador' },
];

type NivelAcesso = 'supervisor' | 'colaborador' | 'visualizador';

const NIVEIS_ACESSO: Record<NivelAcesso, { label: string; cor: string; descricao: string }> = {
  supervisor: { 
    label: 'Supervisor', 
    cor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    descricao: 'Acesso total ao sistema, incluindo gestão de equipe e metas'
  },
  colaborador: { 
    label: 'Colaborador', 
    cor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    descricao: 'Acesso às funcionalidades operacionais e dados próprios'
  },
  visualizador: { 
    label: 'Visualizador', 
    cor: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    descricao: 'Apenas visualização de dados, sem permissão de edição'
  },
};

const Configuracoes = () => {
  const { logout, funcionario } = useAuth();
  const navigate = useNavigate();
  
  // Estado para alteração de senha
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  // Estado para gestão de usuários
  const [usuarios, setUsuarios] = useState(USUARIOS_MOCK);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleSavePassword = () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast.error('Preencha todos os campos');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (novaSenha.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    // Simular alteração de senha
    toast.success('Senha alterada com sucesso!');
    setIsEditingPassword(false);
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
  };

  const handleCancelPassword = () => {
    setIsEditingPassword(false);
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChangeNivelAcesso = (userId: string, novoNivel: NivelAcesso) => {
    setUsuarios(prev => prev.map(u => 
      u.id === userId ? { ...u, nivelAcesso: novoNivel } : u
    ));
    toast.success('Nível de acesso atualizado!');
  };

  const isSupervisor = funcionario?.isSupervisor;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas preferências e configurações do sistema
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair do Sistema
        </Button>
      </div>

      <Tabs defaultValue="conta" className="space-y-6">
        <TabsList>
          <TabsTrigger value="conta" className="gap-2">
            <Settings className="h-4 w-4" />
            Minha Conta
          </TabsTrigger>
          {isSupervisor && (
            <TabsTrigger value="acessos" className="gap-2">
              <Shield className="h-4 w-4" />
              Níveis de Acesso
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="conta" className="space-y-6">
          {/* Informações do Usuário */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Informações do Usuário
              </CardTitle>
              <CardDescription>
                Seus dados de perfil no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Nome</Label>
                  <p className="text-foreground font-medium">{funcionario?.nome || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">E-mail</Label>
                  <p className="text-foreground font-medium">{funcionario?.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Cargo</Label>
                  <p className="text-foreground font-medium">{funcionario?.cargo || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Nível de Acesso</Label>
                  <Badge variant="outline" className={funcionario?.isSupervisor ? NIVEIS_ACESSO.supervisor.cor : NIVEIS_ACESSO.colaborador.cor}>
                    {funcionario?.isSupervisor ? 'Supervisor' : 'Colaborador'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alteração de Senha */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-accent" />
                    Alterar Senha
                  </CardTitle>
                  <CardDescription>
                    Atualize sua senha de acesso ao sistema
                  </CardDescription>
                </div>
                {!isEditingPassword && (
                  <Button variant="outline" onClick={() => setIsEditingPassword(true)}>
                    Alterar Senha
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingPassword ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="senhaAtual">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="senhaAtual"
                        type={showCurrentPassword ? "text" : "password"}
                        value={senhaAtual}
                        onChange={(e) => setSenhaAtual(e.target.value)}
                        placeholder="Digite sua senha atual"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="novaSenha">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="novaSenha"
                        type={showNewPassword ? "text" : "password"}
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        placeholder="Digite a nova senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmarSenha"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        placeholder="Confirme a nova senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSavePassword}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button variant="outline" onClick={handleCancelPassword}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>••••••••</span>
                  <span className="text-sm">(senha oculta)</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isSupervisor && (
          <TabsContent value="acessos" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" />
                  Gestão de Níveis de Acesso
                </CardTitle>
                <CardDescription>
                  Defina o nível de acesso de cada membro da equipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Legenda dos níveis */}
                <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-3 text-sm">Níveis Disponíveis:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(NIVEIS_ACESSO).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <Badge variant="outline" className={value.cor}>
                          {value.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{value.descricao}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Nível Atual</TableHead>
                      <TableHead>Alterar Nível</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{usuario.nome}</p>
                            <p className="text-sm text-muted-foreground">{usuario.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{usuario.cargo}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={NIVEIS_ACESSO[usuario.nivelAcesso as NivelAcesso].cor}>
                            {NIVEIS_ACESSO[usuario.nivelAcesso as NivelAcesso].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={usuario.nivelAcesso}
                            onValueChange={(value) => handleChangeNivelAcesso(usuario.id, value as NivelAcesso)}
                            disabled={usuario.id === funcionario?.id}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="supervisor">Supervisor</SelectItem>
                              <SelectItem value="colaborador">Colaborador</SelectItem>
                              <SelectItem value="visualizador">Visualizador</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Configuracoes;
