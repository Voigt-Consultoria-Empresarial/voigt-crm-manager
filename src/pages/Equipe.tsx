import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Briefcase,
  Building2,
  DollarSign,
  Search,
  Filter,
  X,
  Mail,
  Phone,
  UserCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Star,
  CalendarDays,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Funcionario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  departamento: string;
  dataAdmissao: string;
  status: "ativo" | "inativo" | "ferias";
  avatar?: string;
  metaMensal?: number;
  observacoes?: string;
}

interface ClienteAtribuido {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  valorDividaSelecionada: number;
  estagioNegociacao: string;
  dataAtribuicao: string;
}

interface Tarefa {
  id: string;
  titulo: string;
  status: string;
  prioridade: string;
  dataVencimento?: string;
  responsavel?: string;
}

interface Reuniao {
  id: string;
  titulo: string;
  data: string;
  status: string;
}

const CARGOS = [
  "Advogado Sênior",
  "Advogado Pleno",
  "Advogado Júnior",
  "Consultor Tributário",
  "Analista",
  "Estagiário",
  "Gerente",
  "Diretor",
];

const DEPARTAMENTOS = [
  "Jurídico",
  "Tributário",
  "Consultoria",
  "Administrativo",
  "Comercial",
];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ativo: { label: "Ativo", variant: "default" },
  inativo: { label: "Inativo", variant: "outline" },
  ferias: { label: "Férias", variant: "secondary" },
};

const estagioLabels: Record<string, string> = {
  inicial: "Inicial",
  em_negociacao: "Em Negociação",
  proposta_enviada: "Proposta Enviada",
  contrato_assinado: "Contrato Assinado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const FUNCIONARIOS_INICIAIS: Funcionario[] = [
  {
    id: "func-001",
    nome: "João Silva",
    email: "joao@vmgestao.com.br",
    telefone: "(11) 99999-1111",
    cargo: "Advogado Sênior",
    departamento: "Jurídico",
    dataAdmissao: "2020-03-15",
    status: "ativo",
    metaMensal: 500000,
  },
  {
    id: "func-002",
    nome: "Maria Santos",
    email: "maria@vmgestao.com.br",
    telefone: "(11) 99999-2222",
    cargo: "Advogada Pleno",
    departamento: "Jurídico",
    dataAdmissao: "2021-06-01",
    status: "ativo",
    metaMensal: 350000,
  },
  {
    id: "func-003",
    nome: "Carlos Oliveira",
    email: "carlos@vmgestao.com.br",
    telefone: "(11) 99999-3333",
    cargo: "Advogado Júnior",
    departamento: "Tributário",
    dataAdmissao: "2022-01-10",
    status: "ativo",
    metaMensal: 200000,
  },
  {
    id: "func-004",
    nome: "Ana Costa",
    email: "ana@vmgestao.com.br",
    telefone: "(11) 99999-4444",
    cargo: "Consultora",
    departamento: "Consultoria",
    dataAdmissao: "2019-11-20",
    status: "ferias",
    metaMensal: 400000,
  },
];

const Funcionarios = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [clientes, setClientes] = useState<ClienteAtribuido[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [funcionarioToDelete, setFuncionarioToDelete] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    busca: "",
    cargo: "",
    departamento: "",
    status: "",
  });
  const [formData, setFormData] = useState<Partial<Funcionario>>({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
    departamento: "",
    dataAdmissao: "",
    status: "ativo",
    metaMensal: 0,
    observacoes: "",
  });
  const { toast } = useToast();

  // Load data from localStorage
  useEffect(() => {
    const savedFuncionarios = localStorage.getItem("funcionarios_data");
    if (savedFuncionarios) {
      setFuncionarios(JSON.parse(savedFuncionarios));
    } else {
      setFuncionarios(FUNCIONARIOS_INICIAIS);
      localStorage.setItem("funcionarios_data", JSON.stringify(FUNCIONARIOS_INICIAIS));
    }

    const savedClientes = localStorage.getItem("clientes_empresas");
    if (savedClientes) {
      setClientes(JSON.parse(savedClientes));
    }

    const savedTarefas = localStorage.getItem("tarefas_data");
    if (savedTarefas) {
      setTarefas(JSON.parse(savedTarefas));
    }

    const savedReunioes = localStorage.getItem("reunioes_data");
    if (savedReunioes) {
      setReunioes(JSON.parse(savedReunioes));
    }
  }, []);

  // Save funcionarios to localStorage
  const saveFuncionarios = (data: Funcionario[]) => {
    setFuncionarios(data);
    localStorage.setItem("funcionarios_data", JSON.stringify(data));
  };

  // Get clients for a specific funcionario
  const getClientesDoFuncionario = (funcionarioId: string) => {
    return clientes.filter((c: any) => c.funcionarioId === funcionarioId);
  };

  // Get tasks for a specific funcionario
  const getTarefasDoFuncionario = (funcionarioId: string) => {
    const func = funcionarios.find((f) => f.id === funcionarioId);
    return tarefas.filter((t) => t.responsavel === func?.nome);
  };

  // Get meetings for a specific funcionario
  const getReunioesDoFuncionario = (funcionarioId: string) => {
    const func = funcionarios.find((f) => f.id === funcionarioId);
    return reunioes.filter((r: any) => r.participantes?.includes(func?.nome));
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalFuncionarios = funcionarios.length;
    const ativos = funcionarios.filter((f) => f.status === "ativo").length;
    const totalClientes = clientes.filter((c: any) => c.funcionarioId).length;
    const valorTotalCarteira = clientes
      .filter((c: any) => c.funcionarioId)
      .reduce((acc: number, c: any) => acc + (c.valorDividaSelecionada || 0), 0);

    return {
      totalFuncionarios,
      ativos,
      totalClientes,
      valorTotalCarteira,
    };
  }, [funcionarios, clientes]);

  // Filter funcionarios
  const funcionariosFiltrados = useMemo(() => {
    return funcionarios.filter((func) => {
      if (filters.busca) {
        const searchLower = filters.busca.toLowerCase();
        if (
          !func.nome.toLowerCase().includes(searchLower) &&
          !func.email.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      if (filters.cargo && filters.cargo !== "todos" && func.cargo !== filters.cargo) {
        return false;
      }
      if (filters.departamento && filters.departamento !== "todos" && func.departamento !== filters.departamento) {
        return false;
      }
      if (filters.status && filters.status !== "todos" && func.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [funcionarios, filters]);

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  const clearFilters = () => {
    setFilters({
      busca: "",
      cargo: "",
      departamento: "",
      status: "",
    });
  };

  const handleOpenDialog = (func?: Funcionario) => {
    if (func) {
      setEditingFuncionario(func);
      setFormData({ ...func });
    } else {
      setEditingFuncionario(null);
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        cargo: "",
        departamento: "",
        dataAdmissao: new Date().toISOString().split("T")[0],
        status: "ativo",
        metaMensal: 0,
        observacoes: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.nome || !formData.email || !formData.cargo || !formData.departamento) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (editingFuncionario) {
      const updated = funcionarios.map((f) =>
        f.id === editingFuncionario.id ? { ...f, ...formData } as Funcionario : f
      );
      saveFuncionarios(updated);
      toast({
        title: "Sucesso",
        description: "Funcionário atualizado com sucesso",
      });
    } else {
      const newFuncionario: Funcionario = {
        id: `func-${Date.now()}`,
        ...formData,
      } as Funcionario;
      saveFuncionarios([...funcionarios, newFuncionario]);
      toast({
        title: "Sucesso",
        description: "Funcionário cadastrado com sucesso",
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (!funcionarioToDelete) return;

    const updated = funcionarios.filter((f) => f.id !== funcionarioToDelete);
    saveFuncionarios(updated);
    setDeleteConfirmOpen(false);
    setFuncionarioToDelete(null);
    toast({
      title: "Sucesso",
      description: "Funcionário removido com sucesso",
    });
  };

  const handleViewDetails = (func: Funcionario) => {
    setSelectedFuncionario(func);
    setIsSheetOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getValorCarteiraFuncionario = (funcionarioId: string) => {
    return getClientesDoFuncionario(funcionarioId).reduce(
      (acc: number, c: any) => acc + (c.valorDividaSelecionada || 0),
      0
    );
  };

  const getProgressoMeta = (funcionarioId: string, metaMensal?: number) => {
    if (!metaMensal) return 0;
    const valorCarteira = getValorCarteiraFuncionario(funcionarioId);
    return Math.min((valorCarteira / metaMensal) * 100, 100);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Equipe</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie a equipe e suas carteiras de clientes
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingFuncionario ? "Editar Funcionário" : "Novo Funcionário"}
                </DialogTitle>
                <DialogDescription>
                  {editingFuncionario
                    ? "Atualize os dados do funcionário"
                    : "Preencha os dados para cadastrar um novo funcionário"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Nome do funcionário"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@vmgestao.com.br"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataAdmissao">Data de Admissão</Label>
                    <Input
                      id="dataAdmissao"
                      type="date"
                      value={formData.dataAdmissao}
                      onChange={(e) =>
                        setFormData({ ...formData, dataAdmissao: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo *</Label>
                    <Select
                      value={formData.cargo}
                      onValueChange={(value) => setFormData({ ...formData, cargo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        {CARGOS.map((cargo) => (
                          <SelectItem key={cargo} value={cargo}>
                            {cargo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departamento">Departamento *</Label>
                    <Select
                      value={formData.departamento}
                      onValueChange={(value) =>
                        setFormData({ ...formData, departamento: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTAMENTOS.map((dep) => (
                          <SelectItem key={dep} value={dep}>
                            {dep}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value as Funcionario["status"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="ferias">Férias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaMensal">Meta Mensal (R$)</Label>
                    <Input
                      id="metaMensal"
                      type="number"
                      value={formData.metaMensal}
                      onChange={(e) =>
                        setFormData({ ...formData, metaMensal: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0,00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Input
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Observações adicionais..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingFuncionario ? "Salvar Alterações" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Buscar
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome ou e-mail..."
                    value={filters.busca}
                    onChange={(e) => setFilters({ ...filters, busca: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Cargo
                </Label>
                <Select
                  value={filters.cargo}
                  onValueChange={(value) => setFilters({ ...filters, cargo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {CARGOS.map((cargo) => (
                      <SelectItem key={cargo} value={cargo}>
                        {cargo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Departamento
                </Label>
                <Select
                  value={filters.departamento}
                  onValueChange={(value) => setFilters({ ...filters, departamento: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {DEPARTAMENTOS.map((dep) => (
                      <SelectItem key={dep} value={dep}>
                        {dep}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Status
                </Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="ferias">Férias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Total de Funcionários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics.totalFuncionarios}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.ativos} ativos
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-700" />
              Cargos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {new Set(funcionarios.map((f) => f.cargo)).size}
            </div>
            <p className="text-xs text-muted-foreground">diferentes</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Clientes Atribuídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics.totalClientes}
            </div>
            <p className="text-xs text-muted-foreground">em carteiras</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-800" />
              Valor Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(metrics.valorTotalCarteira)}
            </div>
            <p className="text-xs text-muted-foreground">em carteiras</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Equipe</CardTitle>
          <CardDescription>
            {funcionariosFiltrados.length} funcionário(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Clientes</TableHead>
                <TableHead>Carteira</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcionariosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhum funcionário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                funcionariosFiltrados.map((func) => {
                  const clientesCount = getClientesDoFuncionario(func.id).length;
                  const valorCarteira = getValorCarteiraFuncionario(func.id);
                  const progressoMeta = getProgressoMeta(func.id, func.metaMensal);

                  return (
                    <TableRow key={func.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(func.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{func.nome}</div>
                            <div className="text-sm text-muted-foreground">{func.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{func.cargo}</TableCell>
                      <TableCell>{func.departamento}</TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[func.status]?.variant || "default"}>
                          {statusConfig[func.status]?.label || func.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4 text-blue-500" />
                          <span>{clientesCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatCurrency(valorCarteira)}</span>
                      </TableCell>
                      <TableCell>
                        {func.metaMensal ? (
                          <div className="w-24">
                            <Progress value={progressoMeta} className="h-2" />
                            <span className="text-xs text-muted-foreground">
                              {progressoMeta.toFixed(0)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem onClick={() => handleViewDetails(func)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenDialog(func)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setFuncionarioToDelete(func.id);
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedFuncionario && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {getInitials(selectedFuncionario.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-xl">{selectedFuncionario.nome}</SheetTitle>
                    <SheetDescription>
                      {selectedFuncionario.cargo} • {selectedFuncionario.departamento}
                    </SheetDescription>
                    <Badge
                      variant={statusConfig[selectedFuncionario.status]?.variant || "default"}
                      className="mt-1"
                    >
                      {statusConfig[selectedFuncionario.status]?.label}
                    </Badge>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Contact Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Informações de Contato</h3>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedFuncionario.email}</span>
                    </div>
                    {selectedFuncionario.telefone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedFuncionario.telefone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span>Admissão: {formatDate(selectedFuncionario.dataAdmissao)}</span>
                    </div>
                  </div>
                </div>

                {/* Performance */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Desempenho</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-border">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-2xl font-bold">
                              {getClientesDoFuncionario(selectedFuncionario.id).length}
                            </p>
                            <p className="text-xs text-muted-foreground">Clientes</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-border">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-lg font-bold">
                              {formatCurrency(getValorCarteiraFuncionario(selectedFuncionario.id))}
                            </p>
                            <p className="text-xs text-muted-foreground">Carteira</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {selectedFuncionario.metaMensal && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Meta Mensal</span>
                        <span className="font-medium">
                          {formatCurrency(selectedFuncionario.metaMensal)}
                        </span>
                      </div>
                      <Progress
                        value={getProgressoMeta(selectedFuncionario.id, selectedFuncionario.metaMensal)}
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {getProgressoMeta(selectedFuncionario.id, selectedFuncionario.metaMensal).toFixed(1)}% da meta atingida
                      </p>
                    </div>
                  )}
                </div>

                {/* Clients */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Clientes Atribuídos</h3>
                  {getClientesDoFuncionario(selectedFuncionario.id).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum cliente atribuído
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {getClientesDoFuncionario(selectedFuncionario.id).map((cliente: any) => (
                        <div
                          key={cliente.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {cliente.nomeFantasia || cliente.razaoSocial}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cliente.cnpj}
                            </p>
                          </div>
                          <span className="text-sm font-medium">
                            {formatCurrency(cliente.valorDividaSelecionada || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tasks */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Tarefas Pendentes</h3>
                  {getTarefasDoFuncionario(selectedFuncionario.id).filter((t) => t.status !== "concluida").length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma tarefa pendente
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {getTarefasDoFuncionario(selectedFuncionario.id)
                        .filter((t) => t.status !== "concluida")
                        .slice(0, 5)
                        .map((tarefa) => (
                          <div
                            key={tarefa.id}
                            className="flex items-center gap-2 p-2 bg-muted rounded-lg text-sm"
                          >
                            {tarefa.status === "em_progresso" ? (
                              <Clock className="h-4 w-4 text-accent" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="flex-1 truncate">{tarefa.titulo}</span>
                            <Badge variant="outline" className="text-xs">
                              {tarefa.prioridade}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Observations */}
                {selectedFuncionario.observacoes && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">Observações</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedFuncionario.observacoes}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Funcionarios;
