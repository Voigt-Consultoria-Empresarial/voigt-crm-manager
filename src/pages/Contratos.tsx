import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  MoreHorizontal,
  Eye,
  FileText,
  Search,
  Filter,
  X,
  Building2,
  DollarSign,
  Calendar,
  Percent,
} from "lucide-react";

interface Contrato {
  id: string;
  empresaId: string;
  empresaNome: string;
  servicoId: string;
  servicoNome: string;
  valorDividaBase: number;
  percentualAcordado: number;
  valorHonorarios: number;
  status: "pendente" | "ativo" | "concluido" | "cancelado";
  dataInicio: string;
  dataFim?: string;
  funcionarioResponsavel: string;
}

const CONTRATOS_MOCK: Contrato[] = [
  {
    id: "cont-001",
    empresaId: "emp-001",
    empresaNome: "Tech Solutions Ltda",
    servicoId: "serv-001",
    servicoNome: "Consultoria Tributária",
    valorDividaBase: 1500000,
    percentualAcordado: 15,
    valorHonorarios: 225000,
    status: "ativo",
    dataInicio: "2024-01-15",
    funcionarioResponsavel: "João Silva",
  },
  {
    id: "cont-002",
    empresaId: "emp-002",
    empresaNome: "Indústria ABC S/A",
    servicoId: "serv-002",
    servicoNome: "Recuperação de Crédito",
    valorDividaBase: 3200000,
    percentualAcordado: 20,
    valorHonorarios: 640000,
    status: "ativo",
    dataInicio: "2024-02-01",
    funcionarioResponsavel: "Maria Santos",
  },
  {
    id: "cont-003",
    empresaId: "emp-003",
    empresaNome: "Comércio XYZ ME",
    servicoId: "serv-001",
    servicoNome: "Consultoria Tributária",
    valorDividaBase: 450000,
    percentualAcordado: 18,
    valorHonorarios: 81000,
    status: "concluido",
    dataInicio: "2023-06-10",
    dataFim: "2024-01-20",
    funcionarioResponsavel: "Carlos Oliveira",
  },
  {
    id: "cont-004",
    empresaId: "emp-004",
    empresaNome: "Transportes Rápido Ltda",
    servicoId: "serv-003",
    servicoNome: "Parcelamento Especial",
    valorDividaBase: 780000,
    percentualAcordado: 12,
    valorHonorarios: 93600,
    status: "pendente",
    dataInicio: "2024-03-01",
    funcionarioResponsavel: "Ana Costa",
  },
  {
    id: "cont-005",
    empresaId: "emp-005",
    empresaNome: "Construções Delta S/A",
    servicoId: "serv-002",
    servicoNome: "Recuperação de Crédito",
    valorDividaBase: 2100000,
    percentualAcordado: 22,
    valorHonorarios: 462000,
    status: "cancelado",
    dataInicio: "2023-09-15",
    dataFim: "2023-12-01",
    funcionarioResponsavel: "João Silva",
  },
];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "outline" },
  ativo: { label: "Ativo", variant: "default" },
  concluido: { label: "Concluído", variant: "secondary" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

const Contratos = () => {
  const [contratos] = useState<Contrato[]>(CONTRATOS_MOCK);
  const [showFilters, setShowFilters] = useState(false);
  const [showAlertNovoContrato, setShowAlertNovoContrato] = useState(false);
  const [filters, setFilters] = useState({
    busca: "",
    status: "",
    servico: "",
  });

  const contratosFiltrados = useMemo(() => {
    return contratos.filter((contrato) => {
      if (filters.busca) {
        const searchLower = filters.busca.toLowerCase();
        if (
          !contrato.empresaNome.toLowerCase().includes(searchLower) &&
          !contrato.servicoNome.toLowerCase().includes(searchLower) &&
          !contrato.funcionarioResponsavel.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      if (filters.status && filters.status !== "todos" && contrato.status !== filters.status) {
        return false;
      }
      if (filters.servico && filters.servico !== "todos" && contrato.servicoNome !== filters.servico) {
        return false;
      }
      return true;
    });
  }, [contratos, filters]);

  const servicos = useMemo(() => {
    return [...new Set(contratos.map((c) => c.servicoNome))];
  }, [contratos]);

  const metrics = useMemo(() => {
    const ativos = contratos.filter((c) => c.status === "ativo");
    const totalHonorarios = ativos.reduce((acc, c) => acc + c.valorHonorarios, 0);
    const totalDivida = ativos.reduce((acc, c) => acc + c.valorDividaBase, 0);
    
    return {
      total: contratos.length,
      ativos: ativos.length,
      totalHonorarios,
      totalDivida,
    };
  }, [contratos]);

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  const clearFilters = () => {
    setFilters({
      busca: "",
      status: "",
      servico: "",
    });
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contratos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie contratos de serviços com clientes
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
          <Button onClick={() => setShowAlertNovoContrato(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Contrato
          </Button>
        </div>
      </div>

      {/* Alert for new contract */}
      <AlertDialog open={showAlertNovoContrato} onOpenChange={setShowAlertNovoContrato}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Funcionalidade Externa</AlertDialogTitle>
            <AlertDialogDescription>
              A criação de novos contratos é desenvolvida em outro APP. 
              Por favor, acesse o sistema externo para cadastrar novos contratos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAlertNovoContrato(false)}>
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Filters */}
      {showFilters && (
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por empresa, serviço ou responsável..."
                    value={filters.busca}
                    onChange={(e) => setFilters({ ...filters, busca: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.servico}
                onValueChange={(value) => setFilters({ ...filters, servico: value })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os serviços</SelectItem>
                  {servicos.map((servico) => (
                    <SelectItem key={servico} value={servico}>
                      {servico}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Limpar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">contratos cadastrados</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.ativos}</div>
            <p className="text-xs text-muted-foreground">em execução</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor em Dívidas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalDivida)}</div>
            <p className="text-xs text-muted-foreground">contratos ativos</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Honorários Projetados</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(metrics.totalHonorarios)}</div>
            <p className="text-xs text-muted-foreground">contratos ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Contracts Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Lista de Contratos</CardTitle>
          <CardDescription>
            {contratosFiltrados.length} contrato(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Valor Dívida</TableHead>
                <TableHead>Percentual</TableHead>
                <TableHead>Honorários</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contratosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhum contrato encontrado
                  </TableCell>
                </TableRow>
              ) : (
                contratosFiltrados.map((contrato) => (
                  <TableRow key={contrato.id}>
                    <TableCell className="font-medium">{contrato.empresaNome}</TableCell>
                    <TableCell>{contrato.servicoNome}</TableCell>
                    <TableCell>{formatCurrency(contrato.valorDividaBase)}</TableCell>
                    <TableCell>{contrato.percentualAcordado}%</TableCell>
                    <TableCell className="font-medium text-primary">
                      {formatCurrency(contrato.valorHonorarios)}
                    </TableCell>
                    <TableCell>{contrato.funcionarioResponsavel}</TableCell>
                    <TableCell>{formatDate(contrato.dataInicio)}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[contrato.status].variant}>
                        {statusConfig[contrato.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setShowAlertNovoContrato(true)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalhes
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contratos;
