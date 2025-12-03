import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Users, Building2, Briefcase, Eye, UserCircle, TrendingUp, DollarSign, RefreshCw, Filter, X, Search } from "lucide-react";
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

interface Filters {
  funcionarioId: string;
  naturezaDivida: string;
  valorMin: string;
  valorMax: string;
  statusReceita: string;
  estagioNegociacao: string;
  busca: string;
}

// Funcionários fictícios para demonstração
const FUNCIONARIOS_MOCK: Funcionario[] = [
  { id: 'func-001', nome: 'João Silva', email: 'joao@voigt.com.br', cargo: 'Advogado Sênior' },
  { id: 'func-002', nome: 'Maria Santos', email: 'maria@voigt.com.br', cargo: 'Advogada Pleno' },
  { id: 'func-003', nome: 'Carlos Oliveira', email: 'carlos@voigt.com.br', cargo: 'Advogado Júnior' },
  { id: 'func-004', nome: 'Ana Costa', email: 'ana@voigt.com.br', cargo: 'Consultora' },
];

const ESTAGIOS_NEGOCIACAO = [
  'inicial',
  'em_negociacao',
  'proposta_enviada',
  'contrato_assinado',
  'concluido',
  'cancelado'
];

const Carteira = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [funcionarios] = useState<Funcionario[]>(FUNCIONARIOS_MOCK);
  const [selectedFuncionario, setSelectedFuncionario] = useState<FuncionarioCarteira | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    funcionarioId: '',
    naturezaDivida: '',
    valorMin: '',
    valorMax: '',
    statusReceita: '',
    estagioNegociacao: '',
    busca: ''
  });
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

  // Extrair opções únicas para filtros
  const filterOptions = useMemo(() => {
    const naturezas = [...new Set(empresas.map(e => e.naturezaDivida).filter(Boolean))];
    const status = [...new Set(empresas.map(e => e.statusReceita).filter(Boolean))];
    const estagios = [...new Set(empresas.map(e => e.estagioNegociacao).filter(Boolean))];
    return { naturezas, status, estagios };
  }, [empresas]);

  // Aplicar filtros às empresas
  const empresasFiltradas = useMemo(() => {
    return empresas.filter(emp => {
      // Filtro por funcionário
      if (filters.funcionarioId && filters.funcionarioId !== 'todos') {
        if (filters.funcionarioId === 'sem_atribuicao') {
          if (emp.funcionarioId) return false;
        } else {
          if (emp.funcionarioId !== filters.funcionarioId) return false;
        }
      }

      // Filtro por natureza da dívida
      if (filters.naturezaDivida && filters.naturezaDivida !== 'todos' && emp.naturezaDivida !== filters.naturezaDivida) {
        return false;
      }

      // Filtro por valor mínimo
      if (filters.valorMin && emp.valorDividaSelecionada < parseFloat(filters.valorMin)) {
        return false;
      }

      // Filtro por valor máximo
      if (filters.valorMax && emp.valorDividaSelecionada > parseFloat(filters.valorMax)) {
        return false;
      }

      // Filtro por situação cadastral
      if (filters.statusReceita && filters.statusReceita !== 'todos' && emp.statusReceita !== filters.statusReceita) {
        return false;
      }

      // Filtro por estágio de negociação
      if (filters.estagioNegociacao && filters.estagioNegociacao !== 'todos' && emp.estagioNegociacao !== filters.estagioNegociacao) {
        return false;
      }

      // Filtro por busca (razão social, nome fantasia ou CNPJ)
      if (filters.busca) {
        const searchTerm = filters.busca.toLowerCase();
        const matchRazao = emp.razaoSocial?.toLowerCase().includes(searchTerm);
        const matchFantasia = emp.nomeFantasia?.toLowerCase().includes(searchTerm);
        const matchCnpj = emp.cnpj?.replace(/[^\d]/g, '').includes(filters.busca.replace(/[^\d]/g, ''));
        if (!matchRazao && !matchFantasia && !matchCnpj) return false;
      }

      return true;
    });
  }, [empresas, filters]);

  const getCarteirasPorFuncionario = (): FuncionarioCarteira[] => {
    return funcionarios.map(func => {
      const clientesDoFuncionario = empresasFiltradas.filter(emp => emp.funcionarioId === func.id);
      const valorTotal = clientesDoFuncionario.reduce((acc, emp) => acc + emp.valorDividaSelecionada, 0);
      return {
        ...func,
        clientes: clientesDoFuncionario,
        valorTotalCarteira: valorTotal
      };
    });
  };

  const getClientesSemAtribuicao = () => {
    return empresasFiltradas.filter(emp => !emp.funcionarioId);
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

  const clearFilters = () => {
    setFilters({
      funcionarioId: '',
      naturezaDivida: '',
      valorMin: '',
      valorMax: '',
      statusReceita: '',
      estagioNegociacao: '',
      busca: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatEstagio = (estagio: string) => {
    const labels: Record<string, string> = {
      'inicial': 'Inicial',
      'em_negociacao': 'Em Negociação',
      'proposta_enviada': 'Proposta Enviada',
      'contrato_assinado': 'Contrato Assinado',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado'
    };
    return labels[estagio] || estagio;
  };

  const carteiras = getCarteirasPorFuncionario();
  const clientesSemAtribuicao = getClientesSemAtribuicao();
  const totalClientes = empresasFiltradas.length;
  const totalValorCarteira = empresasFiltradas.reduce((acc, emp) => acc + emp.valorDividaSelecionada, 0);
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
        <div className="flex items-center gap-2">
          <Button 
            variant={showFilters ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                !
              </Badge>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={loadEmpresas}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card className="border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Filtros de Busca
              </CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Busca por texto */}
              <div className="lg:col-span-2">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Razão social, nome fantasia ou CNPJ..."
                    value={filters.busca}
                    onChange={(e) => setFilters(prev => ({ ...prev, busca: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Funcionário */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Funcionário</label>
                <Select 
                  value={filters.funcionarioId} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, funcionarioId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="sem_atribuicao">Sem Atribuição</SelectItem>
                    {funcionarios.map((func) => (
                      <SelectItem key={func.id} value={func.id}>
                        {func.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Natureza da Dívida */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Natureza da Dívida</label>
                <Select 
                  value={filters.naturezaDivida} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, naturezaDivida: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    {filterOptions.naturezas.map((nat) => (
                      <SelectItem key={nat} value={nat}>
                        {nat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Valor Mínimo */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Valor Mínimo (R$)</label>
                <Input
                  type="number"
                  placeholder="0,00"
                  value={filters.valorMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, valorMin: e.target.value }))}
                />
              </div>

              {/* Valor Máximo */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Valor Máximo (R$)</label>
                <Input
                  type="number"
                  placeholder="999.999,00"
                  value={filters.valorMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, valorMax: e.target.value }))}
                />
              </div>

              {/* Situação Cadastral */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Situação Cadastral</label>
                <Select 
                  value={filters.statusReceita} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, statusReceita: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    {filterOptions.status.map((stat) => (
                      <SelectItem key={stat} value={stat}>
                        {stat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estágio de Negociação */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Estágio de Negociação</label>
                <Select 
                  value={filters.estagioNegociacao} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, estagioNegociacao: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {filterOptions.estagios.length > 0 ? (
                      filterOptions.estagios.map((est) => (
                        <SelectItem key={est} value={est}>
                          {formatEstagio(est)}
                        </SelectItem>
                      ))
                    ) : (
                      ESTAGIOS_NEGOCIACAO.map((est) => (
                        <SelectItem key={est} value={est}>
                          {formatEstagio(est)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Exibindo <span className="font-semibold text-foreground">{empresasFiltradas.length}</span> de{" "}
                  <span className="font-semibold text-foreground">{empresas.length}</span> clientes
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription>Total de Clientes {hasActiveFilters && "(filtrado)"}</CardDescription>
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
            <CardDescription>Valor Total em Carteira {hasActiveFilters && "(filtrado)"}</CardDescription>
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
                  <TableHead>Natureza</TableHead>
                  <TableHead>Estágio</TableHead>
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
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{empresa.naturezaDivida}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{formatEstagio(empresa.estagioNegociacao)}</Badge>
                    </TableCell>
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
                                <Badge variant="secondary">{formatEstagio(empresa.estagioNegociacao)}</Badge>
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
