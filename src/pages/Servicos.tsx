import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Edit,
  Briefcase,
  Search,
  Percent,
  FileText,
  TrendingUp,
} from "lucide-react";

interface Servico {
  id: string;
  nome: string;
  descricao: string;
  percentualTetoNegociacao: number;
  status: "ativo" | "inativo";
  contratosAtivos: number;
  valorTotalContratado: number;
}

const SERVICOS_MOCK: Servico[] = [
  {
    id: "serv-001",
    nome: "Consultoria Tributária",
    descricao: "Análise e revisão de tributos federais, estaduais e municipais. Identificação de oportunidades de recuperação de créditos tributários.",
    percentualTetoNegociacao: 25,
    status: "ativo",
    contratosAtivos: 12,
    valorTotalContratado: 4500000,
  },
  {
    id: "serv-002",
    nome: "Recuperação de Crédito",
    descricao: "Serviço especializado na recuperação de créditos junto à Receita Federal, incluindo compensação e restituição de valores pagos indevidamente.",
    percentualTetoNegociacao: 30,
    status: "ativo",
    contratosAtivos: 8,
    valorTotalContratado: 7800000,
  },
  {
    id: "serv-003",
    nome: "Parcelamento Especial",
    descricao: "Assessoria para adesão a programas de parcelamento especial (REFIS, PERT, etc.) com negociação de melhores condições.",
    percentualTetoNegociacao: 15,
    status: "ativo",
    contratosAtivos: 5,
    valorTotalContratado: 1200000,
  },
  {
    id: "serv-004",
    nome: "Planejamento Tributário",
    descricao: "Estruturação de operações societárias e comerciais visando a otimização da carga tributária de forma legal.",
    percentualTetoNegociacao: 20,
    status: "ativo",
    contratosAtivos: 3,
    valorTotalContratado: 890000,
  },
  {
    id: "serv-005",
    nome: "Defesa Administrativa",
    descricao: "Representação em processos administrativos fiscais, incluindo impugnações, recursos e acompanhamento junto aos órgãos fazendários.",
    percentualTetoNegociacao: 18,
    status: "inativo",
    contratosAtivos: 0,
    valorTotalContratado: 0,
  },
  {
    id: "serv-006",
    nome: "Revisão de FGTS",
    descricao: "Análise e recuperação de valores de FGTS pagos indevidamente ou em excesso, incluindo multas e juros.",
    percentualTetoNegociacao: 22,
    status: "ativo",
    contratosAtivos: 6,
    valorTotalContratado: 2100000,
  },
];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ativo: { label: "Ativo", variant: "default" },
  inativo: { label: "Inativo", variant: "secondary" },
};

const Servicos = () => {
  const [servicos] = useState<Servico[]>(SERVICOS_MOCK);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAlertNovoServico, setShowAlertNovoServico] = useState(false);

  const servicosFiltrados = useMemo(() => {
    if (!searchTerm) return servicos;
    const searchLower = searchTerm.toLowerCase();
    return servicos.filter(
      (servico) =>
        servico.nome.toLowerCase().includes(searchLower) ||
        servico.descricao.toLowerCase().includes(searchLower)
    );
  }, [servicos, searchTerm]);

  const metrics = useMemo(() => {
    const ativos = servicos.filter((s) => s.status === "ativo");
    const totalContratos = ativos.reduce((acc, s) => acc + s.contratosAtivos, 0);
    const valorTotal = ativos.reduce((acc, s) => acc + s.valorTotalContratado, 0);
    const percentualMedio = ativos.length > 0
      ? ativos.reduce((acc, s) => acc + s.percentualTetoNegociacao, 0) / ativos.length
      : 0;

    return {
      total: servicos.length,
      ativos: ativos.length,
      totalContratos,
      valorTotal,
      percentualMedio: percentualMedio.toFixed(1),
    };
  }, [servicos]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Serviços</h1>
          <p className="text-muted-foreground mt-1">
            Cadastre e gerencie os serviços oferecidos
          </p>
        </div>
        <Button onClick={() => setShowAlertNovoServico(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Alert for new service */}
      <AlertDialog open={showAlertNovoServico} onOpenChange={setShowAlertNovoServico}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Funcionalidade Externa</AlertDialogTitle>
            <AlertDialogDescription>
              A criação de novos serviços é desenvolvida em outro APP.
              Por favor, acesse o sistema externo para cadastrar novos serviços.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAlertNovoServico(false)}>
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar serviços..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">{metrics.ativos} ativos</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.totalContratos}</div>
            <p className="text-xs text-muted-foreground">utilizando serviços</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Contratado</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.valorTotal)}</div>
            <p className="text-xs text-muted-foreground">em contratos ativos</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Percentual Médio</CardTitle>
            <Percent className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.percentualMedio}%</div>
            <p className="text-xs text-muted-foreground">teto de negociação</p>
          </CardContent>
        </Card>
      </div>

      {/* Services Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Tipos de Serviços</CardTitle>
          <CardDescription>
            Configure serviços, percentuais de negociação e descrições
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Serviço</TableHead>
                <TableHead className="max-w-[300px]">Descrição</TableHead>
                <TableHead>Percentual Teto</TableHead>
                <TableHead>Contratos Ativos</TableHead>
                <TableHead>Valor Contratado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servicosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum serviço encontrado
                  </TableCell>
                </TableRow>
              ) : (
                servicosFiltrados.map((servico) => (
                  <TableRow key={servico.id}>
                    <TableCell className="font-medium">{servico.nome}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground">
                      {servico.descricao}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {servico.percentualTetoNegociacao}%
                      </Badge>
                    </TableCell>
                    <TableCell>{servico.contratosAtivos}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(servico.valorTotalContratado)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[servico.status].variant}>
                        {statusConfig[servico.status].label}
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
                          <DropdownMenuItem onClick={() => setShowAlertNovoServico(true)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setShowAlertNovoServico(true)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
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

export default Servicos;
