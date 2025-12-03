import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Users, Building2, Briefcase, Eye, UserCircle, TrendingUp, DollarSign, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Empresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  uf: string;
  valorTotalDivida: number;
  valorDividaSelecionada: number;
  naturezaDivida: string;
  statusReceita: string;
  estagioNegociacao: string;
  funcionarioId?: string;
  funcionarioNome?: string;
  informacoesExtras: Record<string, any>;
  dataConversao: string;
}

interface Funcionario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
}

interface FuncionarioCarteira extends Funcionario {
  clientes: Empresa[];
  valorTotalCarteira: number;
}

// Funcionários fictícios para demonstração
const FUNCIONARIOS_MOCK: Funcionario[] = [
  { id: 'func-001', nome: 'João Silva', email: 'joao@voigt.com.br', cargo: 'Advogado Sênior' },
  { id: 'func-002', nome: 'Maria Santos', email: 'maria@voigt.com.br', cargo: 'Advogada Pleno' },
  { id: 'func-003', nome: 'Carlos Oliveira', email: 'carlos@voigt.com.br', cargo: 'Advogado Júnior' },
  { id: 'func-004', nome: 'Ana Costa', email: 'ana@voigt.com.br', cargo: 'Consultora' },
];

const Carteira = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [funcionarios] = useState<Funcionario[]>(FUNCIONARIOS_MOCK);
  const [selectedFuncionario, setSelectedFuncionario] = useState<FuncionarioCarteira | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();
  const { funcionario: currentUser } = useAuth();

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = () => {
    const savedEmpresas = localStorage.getItem('clientes_empresas');
    if (savedEmpresas) {
      setEmpresas(JSON.parse(savedEmpresas));
    }
  };

  const getCarteirasPorFuncionario = (): FuncionarioCarteira[] => {
    return funcionarios.map(func => {
      const clientesDoFuncionario = empresas.filter(emp => emp.funcionarioId === func.id);
      const valorTotal = clientesDoFuncionario.reduce((acc, emp) => acc + emp.valorDividaSelecionada, 0);
      return {
        ...func,
        clientes: clientesDoFuncionario,
        valorTotalCarteira: valorTotal
      };
    });
  };

  const getClientesSemAtribuicao = () => {
    return empresas.filter(emp => !emp.funcionarioId);
  };

  const handleViewCarteira = (funcCarteira: FuncionarioCarteira) => {
    setSelectedFuncionario(funcCarteira);
    setIsSheetOpen(true);
  };

  const handleAtribuirCliente = (empresaId: string, funcionarioId: string) => {
    const funcionarioSelecionado = funcionarios.find(f => f.id === funcionarioId);
    
    const updatedEmpresas = empresas.map(emp => {
      if (emp.id === empresaId) {
        return {
          ...emp,
          funcionarioId: funcionarioId,
          funcionarioNome: funcionarioSelecionado?.nome,
          informacoesExtras: {
            ...emp.informacoesExtras,
            adicionadoPor: {
              funcionarioId: funcionarioId,
              funcionarioNome: funcionarioSelecionado?.nome,
              funcionarioCargo: funcionarioSelecionado?.cargo,
              dataAtribuicao: new Date().toISOString()
            }
          }
        };
      }
      return emp;
    });

    setEmpresas(updatedEmpresas);
    localStorage.setItem('clientes_empresas', JSON.stringify(updatedEmpresas));

    toast({
      title: "Cliente atribuído",
      description: `Cliente atribuído para ${funcionarioSelecionado?.nome}`,
    });
  };

  const handleRemoverAtribuicao = (empresaId: string) => {
    const updatedEmpresas = empresas.map(emp => {
      if (emp.id === empresaId) {
        const { adicionadoPor, ...restExtras } = emp.informacoesExtras || {};
        return {
          ...emp,
          funcionarioId: undefined,
          funcionarioNome: undefined,
          informacoesExtras: restExtras
        };
      }
      return emp;
    });

    setEmpresas(updatedEmpresas);
    localStorage.setItem('clientes_empresas', JSON.stringify(updatedEmpresas));

    toast({
      title: "Atribuição removida",
      description: "O cliente não está mais atribuído a nenhum funcionário",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const carteiras = getCarteirasPorFuncionario();
  const clientesSemAtribuicao = getClientesSemAtribuicao();
  const totalClientes = empresas.length;
  const totalValorCarteira = empresas.reduce((acc, emp) => acc + emp.valorDividaSelecionada, 0);
  const maxClientesPorFunc = Math.max(...carteiras.map(c => c.clientes.length), 1);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Carteira de Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Visualize e gerencie a distribuição de clientes por funcionário
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadEmpresas}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription>Total de Clientes</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              {totalClientes}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription>Funcionários Ativos</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              {funcionarios.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription>Valor Total em Carteira</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              {formatCurrency(totalValorCarteira)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription>Clientes Sem Atribuição</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-destructive" />
              {clientesSemAtribuicao.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Distribuição por Funcionário */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-accent" />
            Distribuição por Funcionário
          </CardTitle>
          <CardDescription>
            Visualize a carga de trabalho de cada funcionário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead className="text-center">Clientes</TableHead>
                <TableHead>Distribuição</TableHead>
                <TableHead className="text-right">Valor em Carteira</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carteiras.map((func) => (
                <TableRow key={func.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">{func.nome}</p>
                        <p className="text-xs text-muted-foreground">{func.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{func.cargo}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-lg px-3">
                      {func.clientes.length}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-48">
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(func.clientes.length / maxClientesPorFunc) * 100} 
                        className="h-2"
                      />
                      <span className="text-xs text-muted-foreground w-12">
                        {totalClientes > 0 ? Math.round((func.clientes.length / totalClientes) * 100) : 0}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(func.valorTotalCarteira)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewCarteira(func)}
                      disabled={func.clientes.length === 0}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Carteira
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Clientes Sem Atribuição */}
      {clientesSemAtribuicao.length > 0 && (
        <Card className="border-border border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Building2 className="h-5 w-5" />
              Clientes Sem Atribuição
            </CardTitle>
            <CardDescription>
              Atribua estes clientes a um funcionário responsável
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Razão Social</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>UF</TableHead>
                  <TableHead className="text-right">Valor Selecionado</TableHead>
                  <TableHead>Atribuir para</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesSemAtribuicao.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold text-foreground">{empresa.razaoSocial}</p>
                        {empresa.nomeFantasia && (
                          <p className="text-xs text-muted-foreground">{empresa.nomeFantasia}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm whitespace-nowrap">{empresa.cnpj}</TableCell>
                    <TableCell>{empresa.uf}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(empresa.valorDividaSelecionada)}
                    </TableCell>
                    <TableCell>
                      <Select onValueChange={(value) => handleAtribuirCliente(empresa.id, value)}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Selecionar funcionário" />
                        </SelectTrigger>
                        <SelectContent>
                          {funcionarios.map((func) => (
                            <SelectItem key={func.id} value={func.id}>
                              {func.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Sheet de Detalhes da Carteira */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedFuncionario && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  Carteira de {selectedFuncionario.nome}
                </SheetTitle>
                <SheetDescription>
                  {selectedFuncionario.cargo} | {selectedFuncionario.clientes.length} clientes | {formatCurrency(selectedFuncionario.valorTotalCarteira)} em carteira
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                {selectedFuncionario.clientes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Building2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      Nenhum cliente na carteira
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Atribua clientes para este funcionário na seção acima.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedFuncionario.clientes.map((empresa) => (
                      <Card key={empresa.id} className="border-border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="font-semibold text-foreground">{empresa.razaoSocial}</p>
                              {empresa.nomeFantasia && (
                                <p className="text-sm text-muted-foreground">{empresa.nomeFantasia}</p>
                              )}
                              <p className="text-xs font-mono text-muted-foreground">{empresa.cnpj}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">{empresa.naturezaDivida}</Badge>
                                <Badge variant="secondary">{empresa.uf}</Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">
                                {formatCurrency(empresa.valorDividaSelecionada)}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive mt-2"
                                onClick={() => {
                                  handleRemoverAtribuicao(empresa.id);
                                  setSelectedFuncionario({
                                    ...selectedFuncionario,
                                    clientes: selectedFuncionario.clientes.filter(c => c.id !== empresa.id),
                                    valorTotalCarteira: selectedFuncionario.valorTotalCarteira - empresa.valorDividaSelecionada
                                  });
                                }}
                              >
                                Remover da carteira
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Carteira;
