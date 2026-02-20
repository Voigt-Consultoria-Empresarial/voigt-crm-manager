import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Building2,
  Users,
  Phone,
  Mail,
  Flame,
  Snowflake,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Megaphone,
  FileText,
  Globe,
  UserPlus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

type LeadTemperatura = "quente" | "morno" | "frio";
type LeadStatus = "novo" | "em_contato" | "qualificado" | "negociando" | "convertido" | "perdido";
type LeadOrigem = "lista" | "anuncio" | "formulario" | "indicacao" | "site" | "outro";
type ContatoStatus = "nao_contatado" | "tentativa" | "contatado" | "sem_resposta";

interface Socio {
  id: string;
  nome: string;
  documento: string;
  telefones: string[];
  emails: string[];
}

interface Lead {
  id: string;
  empresaNome: string;
  empresaCnpj: string;
  empresaUf: string;
  temperatura: LeadTemperatura;
  status: LeadStatus;
  contatoStatus: ContatoStatus;
  origem: LeadOrigem;
  origemDetalhe?: string;
  responsavelId?: string;
  responsavelNome?: string;
  quemTrouxe: string;
  socios: Socio[];
  observacoes: string;
  valorEstimado?: number;
  dataCriacao: string;
  dataUltimoContato?: string;
}

const LEADS_MOCK: Lead[] = [
  {
    id: "1",
    empresaNome: "Tech Solutions Ltda",
    empresaCnpj: "12.345.678/0001-90",
    empresaUf: "SP",
    temperatura: "quente",
    status: "qualificado",
    contatoStatus: "contatado",
    origem: "anuncio",
    origemDetalhe: "Google Ads - Campanha FGTS",
    responsavelId: "1",
    responsavelNome: "João Silva",
    quemTrouxe: "Marketing Digital",
    socios: [
      { id: "1", nome: "Carlos Eduardo Santos", documento: "123.456.789-00", telefones: ["11999887766", "1133445566"], emails: ["carlos@techsolutions.com"] },
      { id: "2", nome: "Ana Paula Oliveira", documento: "987.654.321-00", telefones: ["11988776655"], emails: ["ana@techsolutions.com"] }
    ],
    observacoes: "Empresa interessada em regularização FGTS. Reunião agendada para próxima semana.",
    valorEstimado: 150000,
    dataCriacao: "2024-01-10",
    dataUltimoContato: "2024-01-15"
  },
  {
    id: "2",
    empresaNome: "Comércio Central EIRELI",
    empresaCnpj: "98.765.432/0001-10",
    empresaUf: "RJ",
    temperatura: "morno",
    status: "em_contato",
    contatoStatus: "tentativa",
    origem: "lista",
    origemDetalhe: "Lista PGFN Janeiro 2024",
    responsavelId: "2",
    responsavelNome: "Maria Santos",
    quemTrouxe: "Parceiro Externo - ABC Consultoria",
    socios: [
      { id: "3", nome: "Roberto Almeida", documento: "456.789.123-00", telefones: ["21988776655"], emails: ["roberto@comerciocentral.com"] }
    ],
    observacoes: "Tentativa de contato realizada. Aguardando retorno.",
    valorEstimado: 85000,
    dataCriacao: "2024-01-08",
    dataUltimoContato: "2024-01-12"
  },
  {
    id: "3",
    empresaNome: "Indústria Metalúrgica Norte S/A",
    empresaCnpj: "45.678.901/0001-23",
    empresaUf: "MG",
    temperatura: "frio",
    status: "novo",
    contatoStatus: "nao_contatado",
    origem: "formulario",
    origemDetalhe: "Formulário Site - Página FGTS",
    quemTrouxe: "Site Institucional",
    socios: [
      { id: "4", nome: "José Carlos Pereira", documento: "789.123.456-00", telefones: ["31999887766"], emails: ["jose@metalurgicanorte.com"] },
      { id: "5", nome: "Maria Helena Costa", documento: "321.654.987-00", telefones: ["31988776655", "3133221100"], emails: ["maria@metalurgicanorte.com", "financeiro@metalurgicanorte.com"] }
    ],
    observacoes: "Lead gerado via formulário do site. Ainda não foi feito contato.",
    valorEstimado: 320000,
    dataCriacao: "2024-01-15"
  },
  {
    id: "4",
    empresaNome: "Construtora Sul Ltda",
    empresaCnpj: "11.222.333/0001-44",
    empresaUf: "PR",
    temperatura: "quente",
    status: "negociando",
    contatoStatus: "contatado",
    origem: "indicacao",
    origemDetalhe: "Indicação do cliente XYZ Engenharia",
    responsavelId: "1",
    responsavelNome: "João Silva",
    quemTrouxe: "Cliente XYZ Engenharia",
    socios: [
      { id: "6", nome: "Fernando Souza", documento: "111.222.333-44", telefones: ["41999887766"], emails: ["fernando@construtorasul.com"] }
    ],
    observacoes: "Em fase final de negociação. Proposta enviada aguardando aprovação.",
    valorEstimado: 450000,
    dataCriacao: "2024-01-05",
    dataUltimoContato: "2024-01-14"
  },
  {
    id: "5",
    empresaNome: "Distribuidora Leste ME",
    empresaCnpj: "55.666.777/0001-88",
    empresaUf: "BA",
    temperatura: "morno",
    status: "em_contato",
    contatoStatus: "contatado",
    origem: "site",
    origemDetalhe: "Chat do Site",
    responsavelId: "2",
    responsavelNome: "Maria Santos",
    quemTrouxe: "Atendimento Online",
    socios: [
      { id: "7", nome: "Paula Regina Lima", documento: "444.555.666-77", telefones: ["71988776655"], emails: ["paula@distribuidoraleste.com"] }
    ],
    observacoes: "Primeiro contato realizado. Interessada em saber mais sobre os serviços.",
    valorEstimado: 75000,
    dataCriacao: "2024-01-12",
    dataUltimoContato: "2024-01-13"
  },
  {
    id: "6",
    empresaNome: "Transportadora Express Ltda",
    empresaCnpj: "22.333.444/0001-55",
    empresaUf: "SC",
    temperatura: "frio",
    status: "perdido",
    contatoStatus: "sem_resposta",
    origem: "lista",
    origemDetalhe: "Lista PGFN Dezembro 2023",
    quemTrouxe: "Equipe Prospecção",
    socios: [
      { id: "8", nome: "Ricardo Mendes", documento: "777.888.999-00", telefones: ["48999887766"], emails: ["ricardo@expresslog.com"] }
    ],
    observacoes: "Múltiplas tentativas de contato sem sucesso. Lead arquivado.",
    valorEstimado: 120000,
    dataCriacao: "2023-12-20",
    dataUltimoContato: "2024-01-10"
  },
  {
    id: "7",
    empresaNome: "Agropecuária Oeste S/A",
    empresaCnpj: "33.444.555/0001-66",
    empresaUf: "MT",
    temperatura: "quente",
    status: "convertido",
    contatoStatus: "contatado",
    origem: "anuncio",
    origemDetalhe: "Facebook Ads - Agronegócio",
    responsavelId: "1",
    responsavelNome: "João Silva",
    quemTrouxe: "Marketing Digital",
    socios: [
      { id: "9", nome: "Marcos Antonio Silva", documento: "222.333.444-55", telefones: ["65999887766", "6533221100"], emails: ["marcos@agroeste.com", "diretoria@agroeste.com"] }
    ],
    observacoes: "Lead convertido em cliente! Contrato assinado em 12/01/2024.",
    valorEstimado: 580000,
    dataCriacao: "2023-12-15",
    dataUltimoContato: "2024-01-12"
  },
  {
    id: "8",
    empresaNome: "Clínica Saúde Total Ltda",
    empresaCnpj: "66.777.888/0001-99",
    empresaUf: "GO",
    temperatura: "morno",
    status: "qualificado",
    contatoStatus: "contatado",
    origem: "formulario",
    origemDetalhe: "Landing Page - Campanha Saúde",
    responsavelId: "2",
    responsavelNome: "Maria Santos",
    quemTrouxe: "Campanha Email Marketing",
    socios: [
      { id: "10", nome: "Dr. Paulo Henrique", documento: "555.666.777-88", telefones: ["62988776655"], emails: ["paulo@saudetotal.com"] }
    ],
    observacoes: "Lead qualificado. Interessado em revisão de débitos trabalhistas.",
    valorEstimado: 95000,
    dataCriacao: "2024-01-11",
    dataUltimoContato: "2024-01-14"
  }
];

const COLABORADORES = [
  { id: "1", nome: "João Silva" },
  { id: "2", nome: "Maria Santos" }
];

const temperaturaConfig: Record<LeadTemperatura, { label: string; icon: React.ReactNode; className: string }> = {
  quente: { label: "Quente", icon: <Flame className="h-3 w-3" />, className: "bg-blue-200 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  morno: { label: "Morno", icon: <Clock className="h-3 w-3" />, className: "bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-400" },
  frio: { label: "Frio", icon: <Snowflake className="h-3 w-3" />, className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" }
};

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  novo: { label: "Novo", className: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
  em_contato: { label: "Em Contato", className: "bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-300" },
  qualificado: { label: "Qualificado", className: "bg-blue-200 text-blue-800 dark:bg-blue-700/40 dark:text-blue-200" },
  negociando: { label: "Negociando", className: "bg-blue-600 text-blue-50 dark:bg-blue-600 dark:text-blue-50" },
  convertido: { label: "Convertido", className: "bg-blue-800 text-blue-50 dark:bg-blue-800 dark:text-blue-50" },
  perdido: { label: "Perdido", className: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300" }
};

const contatoStatusConfig: Record<ContatoStatus, { label: string; icon: React.ReactNode }> = {
  nao_contatado: { label: "Não Contatado", icon: <XCircle className="h-4 w-4 text-slate-400" /> },
  tentativa: { label: "Tentativa", icon: <Clock className="h-4 w-4 text-blue-400" /> },
  contatado: { label: "Contatado", icon: <CheckCircle2 className="h-4 w-4 text-blue-600" /> },
  sem_resposta: { label: "Sem Resposta", icon: <XCircle className="h-4 w-4 text-slate-500" /> }
};

const origemConfig: Record<LeadOrigem, { label: string; icon: React.ReactNode }> = {
  lista: { label: "Lista", icon: <ListFilter className="h-4 w-4" /> },
  anuncio: { label: "Anúncio", icon: <Megaphone className="h-4 w-4" /> },
  formulario: { label: "Formulário", icon: <FileText className="h-4 w-4" /> },
  indicacao: { label: "Indicação", icon: <UserPlus className="h-4 w-4" /> },
  site: { label: "Site", icon: <Globe className="h-4 w-4" /> },
  outro: { label: "Outro", icon: <MoreHorizontal className="h-4 w-4" /> }
};

export default function Leads() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>(LEADS_MOCK);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTemperatura, setFiltroTemperatura] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroOrigem, setFiltroOrigem] = useState<string>("todos");
  const [filtroContato, setFiltroContato] = useState<string>("todos");
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>("todos");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const [formData, setFormData] = useState({
    empresaNome: "",
    empresaCnpj: "",
    empresaUf: "",
    temperatura: "morno" as LeadTemperatura,
    status: "novo" as LeadStatus,
    contatoStatus: "nao_contatado" as ContatoStatus,
    origem: "lista" as LeadOrigem,
    origemDetalhe: "",
    responsavelId: "",
    quemTrouxe: "",
    observacoes: "",
    valorEstimado: ""
  });

  const leadsFiltrados = useMemo(() => {
    return leads.filter(lead => {
      const matchSearch =
        lead.empresaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.empresaCnpj.includes(searchTerm) ||
        lead.socios.some(s => s.nome.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchTemperatura = filtroTemperatura === "todos" || lead.temperatura === filtroTemperatura;
      const matchStatus = filtroStatus === "todos" || lead.status === filtroStatus;
      const matchOrigem = filtroOrigem === "todos" || lead.origem === filtroOrigem;
      const matchContato = filtroContato === "todos" || lead.contatoStatus === filtroContato;
      const matchResponsavel = filtroResponsavel === "todos" ||
        (filtroResponsavel === "sem_responsavel" ? !lead.responsavelId : lead.responsavelId === filtroResponsavel);

      return matchSearch && matchTemperatura && matchStatus && matchOrigem && matchContato && matchResponsavel;
    });
  }, [leads, searchTerm, filtroTemperatura, filtroStatus, filtroOrigem, filtroContato, filtroResponsavel]);

  const totalPaginas = Math.ceil(leadsFiltrados.length / itensPorPagina);
  const leadsPaginados = leadsFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const metricas = useMemo(() => {
    const total = leads.length;
    const quentes = leads.filter(l => l.temperatura === "quente").length;
    const emNegociacao = leads.filter(l => l.status === "negociando").length;
    const convertidos = leads.filter(l => l.status === "convertido").length;
    const valorTotal = leads.reduce((acc, l) => acc + (l.valorEstimado || 0), 0);
    return { total, quentes, emNegociacao, convertidos, valorTotal };
  }, [leads]);

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsSheetOpen(true);
  };

  const handleCreateLead = () => {
    setEditingLead(null);
    setFormData({
      empresaNome: "",
      empresaCnpj: "",
      empresaUf: "",
      temperatura: "morno",
      status: "novo",
      contatoStatus: "nao_contatado",
      origem: "lista",
      origemDetalhe: "",
      responsavelId: "",
      quemTrouxe: "",
      observacoes: "",
      valorEstimado: ""
    });
    setIsDialogOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      empresaNome: lead.empresaNome,
      empresaCnpj: lead.empresaCnpj,
      empresaUf: lead.empresaUf,
      temperatura: lead.temperatura,
      status: lead.status,
      contatoStatus: lead.contatoStatus,
      origem: lead.origem,
      origemDetalhe: lead.origemDetalhe || "",
      responsavelId: lead.responsavelId || "",
      quemTrouxe: lead.quemTrouxe,
      observacoes: lead.observacoes,
      valorEstimado: lead.valorEstimado?.toString() || ""
    });
    setIsDialogOpen(true);
  };

  const handleSaveLead = () => {
    const responsavel = COLABORADORES.find(c => c.id === formData.responsavelId);

    if (editingLead) {
      setLeads(prev => prev.map(l =>
        l.id === editingLead.id
          ? {
            ...l,
            ...formData,
            responsavelNome: responsavel?.nome,
            valorEstimado: formData.valorEstimado ? parseFloat(formData.valorEstimado) : undefined
          }
          : l
      ));
      toast({ title: "Lead atualizado com sucesso!" });
    } else {
      const newLead: Lead = {
        id: Date.now().toString(),
        empresaNome: formData.empresaNome,
        empresaCnpj: formData.empresaCnpj,
        empresaUf: formData.empresaUf,
        temperatura: formData.temperatura,
        status: formData.status,
        contatoStatus: formData.contatoStatus,
        origem: formData.origem,
        origemDetalhe: formData.origemDetalhe,
        responsavelId: formData.responsavelId || undefined,
        responsavelNome: responsavel?.nome,
        quemTrouxe: formData.quemTrouxe,
        socios: [],
        observacoes: formData.observacoes,
        valorEstimado: formData.valorEstimado ? parseFloat(formData.valorEstimado) : undefined,
        dataCriacao: new Date().toISOString().split("T")[0]
      };
      setLeads(prev => [newLead, ...prev]);
      toast({ title: "Lead criado com sucesso!" });
    }
    setIsDialogOpen(false);
  };

  const handleDeleteLead = (lead: Lead) => {
    setLeadToDelete(lead);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (leadToDelete) {
      setLeads(prev => prev.filter(l => l.id !== leadToDelete.id));
      toast({ title: "Lead removido com sucesso!" });
      setIsDeleteDialogOpen(false);
      setLeadToDelete(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: text });
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    window.open(`https://wa.me/${formattedPhone}`, "_blank");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFiltroTemperatura("todos");
    setFiltroStatus("todos");
    setFiltroOrigem("todos");
    setFiltroContato("todos");
    setFiltroResponsavel("todos");
    setPaginaAtual(1);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">Gerencie seus leads de listas, anúncios e formulários</p>
        </div>
        <Button onClick={handleCreateLead}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Quentes</CardTitle>
            <Flame className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.quentes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Negociação</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.emNegociacao}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-800" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.convertidos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Estimado</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metricas.valorTotal)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por empresa, CNPJ ou sócio..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPaginaAtual(1); }}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Select value={filtroTemperatura} onValueChange={(v) => { setFiltroTemperatura(v); setPaginaAtual(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Temperatura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas Temperaturas</SelectItem>
                  <SelectItem value="quente">🔥 Quente</SelectItem>
                  <SelectItem value="morno">⏳ Morno</SelectItem>
                  <SelectItem value="frio">❄️ Frio</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroStatus} onValueChange={(v) => { setFiltroStatus(v); setPaginaAtual(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="em_contato">Em Contato</SelectItem>
                  <SelectItem value="qualificado">Qualificado</SelectItem>
                  <SelectItem value="negociando">Negociando</SelectItem>
                  <SelectItem value="convertido">Convertido</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroOrigem} onValueChange={(v) => { setFiltroOrigem(v); setPaginaAtual(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas Origens</SelectItem>
                  <SelectItem value="lista">📋 Lista</SelectItem>
                  <SelectItem value="anuncio">📢 Anúncio</SelectItem>
                  <SelectItem value="formulario">📝 Formulário</SelectItem>
                  <SelectItem value="indicacao">👤 Indicação</SelectItem>
                  <SelectItem value="site">🌐 Site</SelectItem>
                  <SelectItem value="outro">📌 Outro</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroContato} onValueChange={(v) => { setFiltroContato(v); setPaginaAtual(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Status Contato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Contatos</SelectItem>
                  <SelectItem value="nao_contatado">Não Contatado</SelectItem>
                  <SelectItem value="tentativa">Tentativa</SelectItem>
                  <SelectItem value="contatado">Contatado</SelectItem>
                  <SelectItem value="sem_resposta">Sem Resposta</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroResponsavel} onValueChange={(v) => { setFiltroResponsavel(v); setPaginaAtual(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Responsáveis</SelectItem>
                  <SelectItem value="sem_responsavel">Sem Responsável</SelectItem>
                  {COLABORADORES.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Temperatura</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Valor Est.</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leadsPaginados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum lead encontrado
                  </TableCell>
                </TableRow>
              ) : (
                leadsPaginados.map((lead) => (
                  <TableRow key={lead.id} className="cursor-pointer" onClick={() => handleViewLead(lead)}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.empresaNome}</p>
                        <p className="text-sm text-muted-foreground">{lead.empresaCnpj}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`gap-1 ${temperaturaConfig[lead.temperatura].className}`}>
                        {temperaturaConfig[lead.temperatura].icon}
                        {temperaturaConfig[lead.temperatura].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[lead.status].className}>
                        {statusConfig[lead.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {contatoStatusConfig[lead.contatoStatus].icon}
                        <span className="text-sm">{contatoStatusConfig[lead.contatoStatus].label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {origemConfig[lead.origem].icon}
                        <span className="text-sm">{origemConfig[lead.origem].label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.responsavelNome ? (
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{lead.responsavelNome}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Não atribuído</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.valorEstimado ? formatCurrency(lead.valorEstimado) : "-"}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewLead(lead)}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditLead(lead)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteLead(lead)}
                            className="text-destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Remover
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

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Itens por página:</span>
          <Select value={itensPorPagina.toString()} onValueChange={(v) => { setItensPorPagina(Number(v)); setPaginaAtual(1); }}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Mostrando {((paginaAtual - 1) * itensPorPagina) + 1}-{Math.min(paginaAtual * itensPorPagina, leadsFiltrados.length)} de {leadsFiltrados.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
            disabled={paginaAtual === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Página {paginaAtual} de {totalPaginas || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
            disabled={paginaAtual >= totalPaginas}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedLead && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {selectedLead.empresaNome}
                </SheetTitle>
                <SheetDescription>{selectedLead.empresaCnpj} • {selectedLead.empresaUf}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={`gap-1 ${temperaturaConfig[selectedLead.temperatura].className}`}>
                    {temperaturaConfig[selectedLead.temperatura].icon}
                    {temperaturaConfig[selectedLead.temperatura].label}
                  </Badge>
                  <Badge className={statusConfig[selectedLead.status].className}>
                    {statusConfig[selectedLead.status].label}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {contatoStatusConfig[selectedLead.contatoStatus].icon}
                    <span className="text-sm">{contatoStatusConfig[selectedLead.contatoStatus].label}</span>
                  </div>
                </div>

                <Tabs defaultValue="geral">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="geral">Geral</TabsTrigger>
                    <TabsTrigger value="socios">Sócios ({selectedLead.socios.length})</TabsTrigger>
                    <TabsTrigger value="historico">Histórico</TabsTrigger>
                  </TabsList>

                  <TabsContent value="geral" className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Origem</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {origemConfig[selectedLead.origem].icon}
                          <span>{origemConfig[selectedLead.origem].label}</span>
                        </div>
                        {selectedLead.origemDetalhe && (
                          <p className="text-sm text-muted-foreground mt-1">{selectedLead.origemDetalhe}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Quem Trouxe</Label>
                        <p className="mt-1">{selectedLead.quemTrouxe}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Responsável</Label>
                        <p className="mt-1">{selectedLead.responsavelNome || "Não atribuído"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Valor Estimado</Label>
                        <p className="mt-1 font-semibold">
                          {selectedLead.valorEstimado ? formatCurrency(selectedLead.valorEstimado) : "Não informado"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Data de Criação</Label>
                        <p className="mt-1">{new Date(selectedLead.dataCriacao).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Último Contato</Label>
                        <p className="mt-1">
                          {selectedLead.dataUltimoContato
                            ? new Date(selectedLead.dataUltimoContato).toLocaleDateString("pt-BR")
                            : "Nenhum contato"}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-muted-foreground">Observações</Label>
                      <p className="mt-2 text-sm">{selectedLead.observacoes || "Nenhuma observação"}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="socios" className="mt-4">
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {selectedLead.socios.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">Nenhum sócio cadastrado</p>
                        ) : (
                          selectedLead.socios.map((socio) => (
                            <Card key={socio.id}>
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium">{socio.nome}</p>
                                    <p className="text-sm text-muted-foreground">{socio.documento}</p>
                                  </div>
                                </div>

                                {socio.telefones.length > 0 && (
                                  <div className="mt-3">
                                    <Label className="text-muted-foreground text-xs">Telefones</Label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {socio.telefones.map((tel, idx) => (
                                        <div key={idx} className="flex items-center gap-1 bg-muted rounded-md px-2 py-1">
                                          <Phone className="h-3 w-3" />
                                          <span className="text-sm">{tel}</span>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => copyToClipboard(tel)}
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-green-600"
                                            onClick={() => openWhatsApp(tel)}
                                          >
                                            <MessageCircle className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {socio.emails.length > 0 && (
                                  <div className="mt-3">
                                    <Label className="text-muted-foreground text-xs">E-mails</Label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {socio.emails.map((email, idx) => (
                                        <div key={idx} className="flex items-center gap-1 bg-muted rounded-md px-2 py-1">
                                          <Mail className="h-3 w-3" />
                                          <span className="text-sm">{email}</span>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => copyToClipboard(email)}
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="historico" className="mt-4">
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Histórico de interações em breve</p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={() => { setIsSheetOpen(false); handleEditLead(selectedLead); }}>
                    Editar Lead
                  </Button>
                  <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
                    Fechar
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLead ? "Editar Lead" : "Novo Lead"}</DialogTitle>
            <DialogDescription>
              {editingLead ? "Atualize as informações do lead" : "Preencha as informações do novo lead"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da Empresa *</Label>
                <Input
                  value={formData.empresaNome}
                  onChange={(e) => setFormData(prev => ({ ...prev, empresaNome: e.target.value }))}
                  placeholder="Razão Social ou Nome Fantasia"
                />
              </div>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input
                  value={formData.empresaCnpj}
                  onChange={(e) => setFormData(prev => ({ ...prev, empresaCnpj: e.target.value }))}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>UF</Label>
                <Input
                  value={formData.empresaUf}
                  onChange={(e) => setFormData(prev => ({ ...prev, empresaUf: e.target.value.toUpperCase() }))}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Temperatura</Label>
                <Select value={formData.temperatura} onValueChange={(v) => setFormData(prev => ({ ...prev, temperatura: v as LeadTemperatura }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quente">🔥 Quente</SelectItem>
                    <SelectItem value="morno">⏳ Morno</SelectItem>
                    <SelectItem value="frio">❄️ Frio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as LeadStatus }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="em_contato">Em Contato</SelectItem>
                    <SelectItem value="qualificado">Qualificado</SelectItem>
                    <SelectItem value="negociando">Negociando</SelectItem>
                    <SelectItem value="convertido">Convertido</SelectItem>
                    <SelectItem value="perdido">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status de Contato</Label>
                <Select value={formData.contatoStatus} onValueChange={(v) => setFormData(prev => ({ ...prev, contatoStatus: v as ContatoStatus }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nao_contatado">Não Contatado</SelectItem>
                    <SelectItem value="tentativa">Tentativa</SelectItem>
                    <SelectItem value="contatado">Contatado</SelectItem>
                    <SelectItem value="sem_resposta">Sem Resposta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Origem</Label>
                <Select value={formData.origem} onValueChange={(v) => setFormData(prev => ({ ...prev, origem: v as LeadOrigem }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lista">📋 Lista</SelectItem>
                    <SelectItem value="anuncio">📢 Anúncio</SelectItem>
                    <SelectItem value="formulario">📝 Formulário</SelectItem>
                    <SelectItem value="indicacao">👤 Indicação</SelectItem>
                    <SelectItem value="site">🌐 Site</SelectItem>
                    <SelectItem value="outro">📌 Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Detalhe da Origem</Label>
              <Input
                value={formData.origemDetalhe}
                onChange={(e) => setFormData(prev => ({ ...prev, origemDetalhe: e.target.value }))}
                placeholder="Ex: Lista PGFN Janeiro 2024, Google Ads, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quem Trouxe</Label>
                <Input
                  value={formData.quemTrouxe}
                  onChange={(e) => setFormData(prev => ({ ...prev, quemTrouxe: e.target.value }))}
                  placeholder="Nome do parceiro ou campanha"
                />
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select value={formData.responsavelId || "_none"} onValueChange={(v) => setFormData(prev => ({ ...prev, responsavelId: v === "_none" ? "" : v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Não atribuído</SelectItem>
                    {COLABORADORES.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Valor Estimado (R$)</Label>
              <Input
                type="number"
                value={formData.valorEstimado}
                onChange={(e) => setFormData(prev => ({ ...prev, valorEstimado: e.target.value }))}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Anotações sobre o lead..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveLead} disabled={!formData.empresaNome}>
              {editingLead ? "Salvar Alterações" : "Criar Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o lead "{leadToDelete?.empresaNome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
