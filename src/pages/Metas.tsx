import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Plus,
  Target,
  Users,
  TrendingUp,
  Award,
  Edit,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Meta {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "individual" | "setor";
  colaboradorId?: string;
  colaboradorNome?: string;
  setor?: string;
  valorMeta: number;
  valorAtual: number;
  dataInicio: string;
  dataFim: string;
  status: "ativa" | "concluida" | "expirada" | "cancelada";
  criadoPor: string;
  criadoEm: string;
}

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  status: string;
}

const SETORES = ["Comercial", "Jurídico", "Tributário", "Consultoria", "Administrativo"];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ativa: { label: "Ativa", variant: "default" },
  concluida: { label: "Concluída", variant: "secondary" },
  expirada: { label: "Expirada", variant: "outline" },
  cancelada: { label: "Cancelada", variant: "outline" },
};

const METAS_INICIAIS: Meta[] = [
  {
    id: "meta-001",
    titulo: "Meta Mensal Comercial",
    descricao: "Alcançar R$ 1.000.000 em novos contratos fechados no mês",
    tipo: "setor",
    setor: "Comercial",
    valorMeta: 1000000,
    valorAtual: 650000,
    dataInicio: "2025-01-01",
    dataFim: "2025-01-31",
    status: "ativa",
    criadoPor: "João Silva",
    criadoEm: "2024-12-28",
  },
  {
    id: "meta-002",
    titulo: "Meta Individual João",
    descricao: "Fechar 5 novos contratos de consultoria tributária",
    tipo: "individual",
    colaboradorId: "func-001",
    colaboradorNome: "João Silva",
    valorMeta: 500000,
    valorAtual: 320000,
    dataInicio: "2025-01-01",
    dataFim: "2025-01-31",
    status: "ativa",
    criadoPor: "João Silva",
    criadoEm: "2024-12-28",
  },
  {
    id: "meta-003",
    titulo: "Meta Individual Maria",
    descricao: "Recuperar R$ 350.000 em créditos tributários",
    tipo: "individual",
    colaboradorId: "func-002",
    colaboradorNome: "Maria Santos",
    valorMeta: 350000,
    valorAtual: 280000,
    dataInicio: "2025-01-01",
    dataFim: "2025-01-31",
    status: "ativa",
    criadoPor: "João Silva",
    criadoEm: "2024-12-28",
  },
  {
    id: "meta-004",
    titulo: "Meta Trimestral Comercial",
    descricao: "Expandir carteira de clientes em 20%",
    tipo: "setor",
    setor: "Comercial",
    valorMeta: 3000000,
    valorAtual: 1200000,
    dataInicio: "2025-01-01",
    dataFim: "2025-03-31",
    status: "ativa",
    criadoPor: "João Silva",
    criadoEm: "2024-12-20",
  },
];

const Metas = () => {
  const { funcionario } = useAuth();
  const isSupervisor = funcionario?.isSupervisor ?? false;
  const [metas, setMetas] = useState<Meta[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [selectedMeta, setSelectedMeta] = useState<Meta | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [metaToDelete, setMetaToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"minhas" | "setor" | "equipe" | "todas">("minhas");
  const [formData, setFormData] = useState<Partial<Meta>>({
    titulo: "",
    descricao: "",
    tipo: "individual",
    colaboradorId: "",
    setor: "",
    valorMeta: 0,
    valorAtual: 0,
    dataInicio: new Date().toISOString().split("T")[0],
    dataFim: "",
    status: "ativa",
  });
  const { toast } = useToast();

  // Load data from localStorage
  useEffect(() => {
    const savedMetas = localStorage.getItem("metas_data");
    if (savedMetas) {
      setMetas(JSON.parse(savedMetas));
    } else {
      setMetas(METAS_INICIAIS);
      localStorage.setItem("metas_data", JSON.stringify(METAS_INICIAIS));
    }

    const savedColaboradores = localStorage.getItem("funcionarios_data");
    if (savedColaboradores) {
      setColaboradores(JSON.parse(savedColaboradores));
    }
  }, []);

  // Save metas to localStorage
  const saveMetas = (data: Meta[]) => {
    setMetas(data);
    localStorage.setItem("metas_data", JSON.stringify(data));
  };

  // Filter metas based on user permissions and active tab
  const metasFiltradas = useMemo(() => {
    let filtered = metas;

    if (!isSupervisor) {
      // Colaborador comum: só vê suas metas individuais e metas de setor
      filtered = metas.filter(
        (m) =>
          m.tipo === "setor" ||
          (m.tipo === "individual" && m.colaboradorId === funcionario?.id)
      );
    }

    // Filter by tab
    if (activeTab === "minhas") {
      return filtered.filter(
        (m) => m.tipo === "individual" && m.colaboradorId === funcionario?.id
      );
    } else if (activeTab === "setor") {
      return filtered.filter((m) => m.tipo === "setor");
    } else if (activeTab === "equipe") {
      // Metas individuais de outros colaboradores (só supervisor)
      return metas.filter(
        (m) => m.tipo === "individual" && m.colaboradorId !== funcionario?.id
      );
    }

    // "todas" tab - only for supervisor
    return isSupervisor ? filtered : [];
  }, [metas, activeTab, isSupervisor, funcionario?.id]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const minhasMetas = metas.filter(
      (m) => m.tipo === "individual" && m.colaboradorId === funcionario?.id
    );
    const metasSetor = metas.filter((m) => m.tipo === "setor");

    const progressoMedio = minhasMetas.length > 0
      ? minhasMetas.reduce((acc, m) => acc + (m.valorAtual / m.valorMeta) * 100, 0) / minhasMetas.length
      : 0;

    const metasAtivas = minhasMetas.filter((m) => m.status === "ativa").length;
    const metasConcluidas = minhasMetas.filter((m) => m.status === "concluida").length;

    return {
      totalMinhas: minhasMetas.length,
      totalSetor: metasSetor.length,
      progressoMedio,
      metasAtivas,
      metasConcluidas,
    };
  }, [metas, funcionario?.id]);

  const handleOpenDialog = (meta?: Meta) => {
    if (meta) {
      setEditingMeta(meta);
      setFormData({ ...meta });
    } else {
      // Definir tipo automaticamente baseado na aba ativa
      const tipoAutomatico = activeTab === "setor" ? "setor" : "individual";
      setEditingMeta(null);
      setFormData({
        titulo: "",
        descricao: "",
        tipo: tipoAutomatico,
        colaboradorId: tipoAutomatico === "individual" ? funcionario?.id : "",
        setor: tipoAutomatico === "setor" ? "Comercial" : "",
        valorMeta: 0,
        valorAtual: 0,
        dataInicio: new Date().toISOString().split("T")[0],
        dataFim: "",
        status: "ativa",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.titulo || !formData.valorMeta || !formData.dataFim) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (formData.tipo === "individual" && !formData.colaboradorId) {
      toast({
        title: "Erro",
        description: "Selecione um colaborador para a meta individual",
        variant: "destructive",
      });
      return;
    }

    if (formData.tipo === "setor" && !formData.setor) {
      toast({
        title: "Erro",
        description: "Selecione um setor para a meta",
        variant: "destructive",
      });
      return;
    }

    const colaborador = colaboradores.find((c) => c.id === formData.colaboradorId);

    if (editingMeta) {
      const updated = metas.map((m) =>
        m.id === editingMeta.id
          ? {
            ...m,
            ...formData,
            colaboradorNome: colaborador?.nome || formData.colaboradorNome,
          } as Meta
          : m
      );
      saveMetas(updated);
      toast({
        title: "Sucesso",
        description: "Meta atualizada com sucesso",
      });
    } else {
      const newMeta: Meta = {
        id: `meta-${Date.now()}`,
        ...formData,
        colaboradorNome: colaborador?.nome,
        criadoPor: funcionario?.nome || "",
        criadoEm: new Date().toISOString().split("T")[0],
      } as Meta;
      saveMetas([...metas, newMeta]);
      toast({
        title: "Sucesso",
        description: "Meta criada com sucesso",
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (!metaToDelete) return;

    const updated = metas.filter((m) => m.id !== metaToDelete);
    saveMetas(updated);
    setDeleteConfirmOpen(false);
    setMetaToDelete(null);
    toast({
      title: "Sucesso",
      description: "Meta removida com sucesso",
    });
  };

  const handleViewDetails = (meta: Meta) => {
    setSelectedMeta(meta);
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

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-blue-900";
    if (progress >= 75) return "bg-blue-700";
    if (progress >= 50) return "bg-blue-500";
    return "bg-blue-300";
  };

  const canEditMeta = (meta: Meta) => {
    // Supervisor pode editar qualquer meta
    if (isSupervisor) return true;
    // Colaborador só pode atualizar progresso da sua própria meta
    return meta.tipo === "individual" && meta.colaboradorId === funcionario?.id;
  };

  const canDeleteMeta = (meta: Meta) => {
    // Só supervisor pode deletar metas
    return isSupervisor;
  };

  const canCreateMeta = () => {
    // Qualquer colaborador pode criar meta individual para si
    // Só supervisor pode criar meta de setor ou para outros
    return true;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Metas</h1>
          <p className="text-muted-foreground mt-1">
            {isSupervisor
              ? "Gerencie as metas da equipe e do setor comercial"
              : "Acompanhe suas metas e as metas do setor"}
          </p>
        </div>
        {canCreateMeta() && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingMeta ? "Editar Meta" : "Nova Meta"}
                </DialogTitle>
                <DialogDescription>
                  {editingMeta
                    ? "Atualize os dados da meta"
                    : "Defina uma nova meta para você, um colaborador ou o setor"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      placeholder="Ex: Meta Mensal de Vendas"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Meta *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value: "individual" | "setor") => {
                        setFormData({
                          ...formData,
                          tipo: value,
                          colaboradorId: value === "individual" ? funcionario?.id : "",
                          setor: value === "setor" ? "Comercial" : "",
                        });
                      }}
                      disabled={!isSupervisor && editingMeta?.tipo === "setor"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        {isSupervisor && <SelectItem value="setor">Setor</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.tipo === "individual" && (
                  <div className="space-y-2">
                    <Label htmlFor="colaborador">Colaborador *</Label>
                    <Select
                      value={formData.colaboradorId}
                      onValueChange={(value) => setFormData({ ...formData, colaboradorId: value })}
                      disabled={!isSupervisor}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o colaborador" />
                      </SelectTrigger>
                      <SelectContent>
                        {colaboradores.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome} - {c.cargo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!isSupervisor && (
                      <p className="text-xs text-muted-foreground">
                        Você só pode criar metas para si mesmo
                      </p>
                    )}
                  </div>
                )}

                {formData.tipo === "setor" && (
                  <div className="space-y-2">
                    <Label htmlFor="setor">Setor *</Label>
                    <Select
                      value={formData.setor}
                      onValueChange={(value) => setFormData({ ...formData, setor: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent>
                        {SETORES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva os objetivos da meta"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valorMeta">Valor da Meta (R$) *</Label>
                    <Input
                      id="valorMeta"
                      type="number"
                      value={formData.valorMeta}
                      onChange={(e) =>
                        setFormData({ ...formData, valorMeta: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valorAtual">Valor Atual (R$)</Label>
                    <Input
                      id="valorAtual"
                      type="number"
                      value={formData.valorAtual}
                      onChange={(e) =>
                        setFormData({ ...formData, valorAtual: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataInicio">Data de Início *</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={formData.dataInicio}
                      onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataFim">Data de Término *</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={formData.dataFim}
                      onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                    />
                  </div>
                </div>

                {editingMeta && (
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: Meta["status"]) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativa">Ativa</SelectItem>
                        <SelectItem value="concluida">Concluída</SelectItem>
                        <SelectItem value="expirada">Expirada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingMeta ? "Salvar Alterações" : "Criar Meta"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minhas Metas</CardTitle>
            <Target className="h-4 w-4 text-blue-800" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalMinhas}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.metasAtivas} ativa(s)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas do Setor</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSetor}</div>
            <p className="text-xs text-muted-foreground">Metas comerciais</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.progressoMedio.toFixed(1)}%</div>
            <Progress value={metrics.progressoMedio} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Concluídas</CardTitle>
            <Award className="h-4 w-4 text-blue-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.metasConcluidas}</div>
            <p className="text-xs text-muted-foreground">Este período</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Table */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList>
              <TabsTrigger value="minhas">Minhas Metas</TabsTrigger>
              <TabsTrigger value="setor">Metas do Setor</TabsTrigger>
              {isSupervisor && <TabsTrigger value="equipe">Metas da Equipe</TabsTrigger>}
              {isSupervisor && <TabsTrigger value="todas">Todas</TabsTrigger>}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {metasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground">Nenhuma meta encontrada</h3>
              <p className="text-muted-foreground mt-1">
                {activeTab === "minhas"
                  ? "Você ainda não possui metas individuais"
                  : activeTab === "setor"
                    ? "Não há metas de setor cadastradas"
                    : activeTab === "equipe"
                      ? "Nenhuma meta individual de outros colaboradores"
                      : "Nenhuma meta cadastrada no sistema"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meta</TableHead>
                  <TableHead>Tipo</TableHead>
                  {(activeTab === "todas" || activeTab === "setor" || activeTab === "equipe") && (
                    <TableHead>Colaborador/Setor</TableHead>
                  )}
                  <TableHead>Progresso</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metasFiltradas.map((meta) => {
                  const progresso = (meta.valorAtual / meta.valorMeta) * 100;
                  return (
                    <TableRow key={meta.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{meta.titulo}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {meta.descricao}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={meta.tipo === "setor" ? "secondary" : "outline"}>
                          {meta.tipo === "setor" ? "Setor" : "Individual"}
                        </Badge>
                      </TableCell>
                      {(activeTab === "todas" || activeTab === "setor" || activeTab === "equipe") && (
                        <TableCell>
                          {meta.tipo === "setor" ? meta.setor : meta.colaboradorNome}
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>{formatCurrency(meta.valorAtual)}</span>
                            <span className="text-muted-foreground">
                              de {formatCurrency(meta.valorMeta)}
                            </span>
                          </div>
                          <Progress
                            value={Math.min(progresso, 100)}
                            className={`h-2 ${getProgressColor(progresso)}`}
                          />
                          <p className="text-xs text-muted-foreground text-right">
                            {progresso.toFixed(1)}%
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(meta.dataInicio)}</p>
                          <p className="text-muted-foreground">até {formatDate(meta.dataFim)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[meta.status]?.variant || "default"}>
                          {statusConfig[meta.status]?.label || meta.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(meta)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canEditMeta(meta) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(meta)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDeleteMeta(meta) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setMetaToDelete(meta.id);
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedMeta && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedMeta.titulo}</SheetTitle>
                <SheetDescription>{selectedMeta.descricao}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Progress Section */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Progresso
                  </h4>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        {formatCurrency(selectedMeta.valorAtual)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        de {formatCurrency(selectedMeta.valorMeta)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min((selectedMeta.valorAtual / selectedMeta.valorMeta) * 100, 100)}
                      className="h-3"
                    />
                    <p className="text-center mt-2 text-lg font-bold">
                      {((selectedMeta.valorAtual / selectedMeta.valorMeta) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Detalhes
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tipo</p>
                      <p className="font-medium">
                        {selectedMeta.tipo === "setor" ? "Setor" : "Individual"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        {selectedMeta.tipo === "setor" ? "Setor" : "Colaborador"}
                      </p>
                      <p className="font-medium">
                        {selectedMeta.tipo === "setor"
                          ? selectedMeta.setor
                          : selectedMeta.colaboradorNome}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant={statusConfig[selectedMeta.status]?.variant || "default"}>
                        {statusConfig[selectedMeta.status]?.label || selectedMeta.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Criado por</p>
                      <p className="font-medium">{selectedMeta.criadoPor}</p>
                    </div>
                  </div>
                </div>

                {/* Period Section */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Período
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Início</p>
                      <p className="font-medium">{formatDate(selectedMeta.dataInicio)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Término</p>
                      <p className="font-medium">{formatDate(selectedMeta.dataFim)}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  {canEditMeta(selectedMeta) && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsSheetOpen(false);
                        handleOpenDialog(selectedMeta);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Meta
                    </Button>
                  )}
                  {canDeleteMeta(selectedMeta) && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setIsSheetOpen(false);
                        setMetaToDelete(selectedMeta.id);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Metas;
