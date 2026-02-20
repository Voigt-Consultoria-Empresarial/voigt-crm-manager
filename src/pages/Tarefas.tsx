import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  ListTodo,
  Filter,
  X,
  Search,
  Calendar,
  LayoutList,
  Columns3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TarefaKanban from "@/components/TarefaKanban";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: "baixa" | "media" | "alta" | "urgente";
  status: "pendente" | "em_progresso" | "concluida" | "cancelada";
  dataVencimento?: string;
  dataConclusao?: string;
  clienteNome?: string;
  responsavel?: string;
  categoria?: string;
  notas?: string;
  criadoPor: string;
  criadoPorNome: string;
  criadoEm: string;
}

const prioridadeConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  baixa: { label: "Baixa", variant: "secondary" },
  media: { label: "Média", variant: "outline" },
  alta: { label: "Alta", variant: "default" },
  urgente: { label: "Urgente", variant: "default" },
};

const statusConfig: Record<string, { label: string; icon: typeof Clock }> = {
  pendente: { label: "Pendente", icon: Clock },
  em_progresso: { label: "Em Progresso", icon: ListTodo },
  concluida: { label: "Concluída", icon: CheckCircle2 },
  cancelada: { label: "Cancelada", icon: AlertCircle },
};

const categorias = [
  "Contato Cliente",
  "Documentação",
  "Análise",
  "Negociação",
  "Cobrança",
  "Administrativo",
  "Outro",
];

const Tarefas = () => {
  const { toast } = useToast();
  const { funcionario } = useAuth();

  const [tarefas, setTarefas] = useState<Tarefa[]>(() => {
    const saved = localStorage.getItem("tarefas");
    return saved ? JSON.parse(saved) : [];
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedTarefa, setSelectedTarefa] = useState<Tarefa | null>(null);
  const [editingTarefa, setEditingTarefa] = useState<Tarefa | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"lista" | "kanban">("lista");

  const [filters, setFilters] = useState({
    busca: "",
    status: "todos",
    prioridade: "todos",
    categoria: "todos",
  });

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    prioridade: "media" as Tarefa["prioridade"],
    dataVencimento: "",
    clienteNome: "",
    responsavel: "",
    categoria: "",
    notas: "",
  });

  const saveToLocalStorage = (data: Tarefa[]) => {
    localStorage.setItem("tarefas", JSON.stringify(data));
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      descricao: "",
      prioridade: "media",
      dataVencimento: "",
      clienteNome: "",
      responsavel: "",
      categoria: "",
      notas: "",
    });
    setEditingTarefa(null);
  };

  const handleSubmit = () => {
    if (!formData.titulo) {
      toast({
        title: "Erro",
        description: "O título é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (editingTarefa) {
      const updated = tarefas.map((t) =>
        t.id === editingTarefa.id
          ? {
            ...t,
            ...formData,
          }
          : t
      );
      setTarefas(updated);
      saveToLocalStorage(updated);
      toast({ title: "Tarefa atualizada com sucesso" });
    } else {
      const newTarefa: Tarefa = {
        id: crypto.randomUUID(),
        titulo: formData.titulo,
        descricao: formData.descricao,
        prioridade: formData.prioridade,
        status: "pendente",
        dataVencimento: formData.dataVencimento,
        clienteNome: formData.clienteNome,
        responsavel: formData.responsavel,
        categoria: formData.categoria,
        notas: formData.notas,
        criadoPor: funcionario?.id || "",
        criadoPorNome: funcionario?.nome || "",
        criadoEm: new Date().toISOString(),
      };
      const updated = [...tarefas, newTarefa];
      setTarefas(updated);
      saveToLocalStorage(updated);
      toast({ title: "Tarefa criada com sucesso" });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (tarefa: Tarefa) => {
    setEditingTarefa(tarefa);
    setFormData({
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      prioridade: tarefa.prioridade,
      dataVencimento: tarefa.dataVencimento || "",
      clienteNome: tarefa.clienteNome || "",
      responsavel: tarefa.responsavel || "",
      categoria: tarefa.categoria || "",
      notas: tarefa.notas || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = tarefas.filter((t) => t.id !== id);
    setTarefas(updated);
    saveToLocalStorage(updated);
    toast({ title: "Tarefa excluída" });
  };

  const handleStatusChange = (id: string, status: Tarefa["status"]) => {
    const updated = tarefas.map((t) =>
      t.id === id
        ? {
          ...t,
          status,
          dataConclusao: status === "concluida" ? new Date().toISOString() : undefined,
        }
        : t
    );
    setTarefas(updated);
    saveToLocalStorage(updated);
    toast({ title: "Status atualizado" });
  };

  const handleToggleConcluida = (tarefa: Tarefa) => {
    const newStatus = tarefa.status === "concluida" ? "pendente" : "concluida";
    handleStatusChange(tarefa.id, newStatus);
  };

  const handleView = (tarefa: Tarefa) => {
    setSelectedTarefa(tarefa);
    setIsSheetOpen(true);
  };

  const clearFilters = () => {
    setFilters({
      busca: "",
      status: "todos",
      prioridade: "todos",
      categoria: "todos",
    });
  };

  const tarefasFiltradas = useMemo(() => {
    return tarefas.filter((t) => {
      if (filters.busca) {
        const busca = filters.busca.toLowerCase();
        if (
          !t.titulo.toLowerCase().includes(busca) &&
          !t.descricao.toLowerCase().includes(busca) &&
          !t.clienteNome?.toLowerCase().includes(busca)
        ) {
          return false;
        }
      }
      if (filters.status !== "todos" && t.status !== filters.status) return false;
      if (filters.prioridade !== "todos" && t.prioridade !== filters.prioridade) return false;
      if (filters.categoria !== "todos" && t.categoria !== filters.categoria) return false;
      return true;
    });
  }, [tarefas, filters]);

  const stats = useMemo(() => {
    const hoje = new Date().toISOString().split("T")[0];
    const vencidas = tarefas.filter(
      (t) => t.dataVencimento && t.dataVencimento < hoje && t.status !== "concluida" && t.status !== "cancelada"
    ).length;
    return {
      total: tarefas.length,
      pendentes: tarefas.filter((t) => t.status === "pendente").length,
      emProgresso: tarefas.filter((t) => t.status === "em_progresso").length,
      concluidas: tarefas.filter((t) => t.status === "concluida").length,
      vencidas,
    };
  }, [tarefas]);

  const formatDate = (date: string) => {
    return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
  };

  const isVencida = (tarefa: Tarefa) => {
    if (!tarefa.dataVencimento) return false;
    const hoje = new Date().toISOString().split("T")[0];
    return tarefa.dataVencimento < hoje && tarefa.status !== "concluida" && tarefa.status !== "cancelada";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tarefas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas tarefas e atividades
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTarefa ? "Editar Tarefa" : "Nova Tarefa"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados da tarefa
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                  placeholder="Título da tarefa"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  placeholder="Descrição da tarefa"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select
                    value={formData.prioridade}
                    onValueChange={(value: Tarefa["prioridade"]) =>
                      setFormData({ ...formData, prioridade: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dataVencimento">Data de Vencimento</Label>
                  <Input
                    id="dataVencimento"
                    type="date"
                    value={formData.dataVencimento}
                    onChange={(e) =>
                      setFormData({ ...formData, dataVencimento: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoria: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={formData.responsavel}
                  onChange={(e) =>
                    setFormData({ ...formData, responsavel: e.target.value })
                  }
                  placeholder="Nome do responsável"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clienteNome">Cliente Relacionado</Label>
                <Input
                  id="clienteNome"
                  value={formData.clienteNome}
                  onChange={(e) =>
                    setFormData({ ...formData, clienteNome: e.target.value })
                  }
                  placeholder="Nome do cliente"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  value={formData.notas}
                  onChange={(e) =>
                    setFormData({ ...formData, notas: e.target.value })
                  }
                  placeholder="Observações adicionais"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingTarefa ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
            <ListTodo className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendentes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Progresso
            </CardTitle>
            <ListTodo className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emProgresso}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Concluídas
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-800" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.concluidas}</div>
          </CardContent>
        </Card>
        <Card className={stats.vencidas > 0 ? "border-destructive" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vencidas
            </CardTitle>
            <AlertCircle className={`h-4 w-4 ${stats.vencidas > 0 ? "text-blue-900" : "text-blue-300"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.vencidas > 0 ? "text-blue-900" : ""}`}>
              {stats.vencidas}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Toggle + Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <CardTitle className="text-base">
                {viewMode === "lista" ? "Lista de Tarefas" : "Quadro Kanban"}
              </CardTitle>
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(v) => v && setViewMode(v as "lista" | "kanban")}
                className="bg-muted rounded-md p-1"
              >
                <ToggleGroupItem value="lista" size="sm" className="gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  <LayoutList className="h-4 w-4" />
                  Lista
                </ToggleGroupItem>
                <ToggleGroupItem value="kanban" size="sm" className="gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  <Columns3 className="h-4 w-4" />
                  Kanban
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="border-t pt-4">
            <div className="grid gap-4 md:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={filters.busca}
                  onChange={(e) =>
                    setFilters({ ...filters, busca: e.target.value })
                  }
                  className="pl-9"
                />
              </div>
              <Select
                value={filters.status}
                onValueChange={(v) => setFilters({ ...filters, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_progresso">Em Progresso</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.prioridade}
                onValueChange={(v) => setFilters({ ...filters, prioridade: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas Prioridades</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.categoria}
                onValueChange={(v) => setFilters({ ...filters, categoria: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas Categorias</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        )}

        {/* List View */}
        {viewMode === "lista" && (
          <CardContent>
            {tarefasFiltradas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma tarefa encontrada
              </div>
            ) : (
              <div className="space-y-2">
                {tarefasFiltradas.map((tarefa) => {
                  const StatusIcon = statusConfig[tarefa.status].icon;
                  const vencida = isVencida(tarefa);
                  return (
                    <div
                      key={tarefa.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border ${vencida ? "border-blue-400 bg-blue-50/50" : "border-border"
                        } ${tarefa.status === "concluida" ? "opacity-60" : ""}`}
                    >
                      <Checkbox
                        checked={tarefa.status === "concluida"}
                        onCheckedChange={() => handleToggleConcluida(tarefa)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-medium ${tarefa.status === "concluida" ? "line-through text-muted-foreground" : ""
                              }`}
                          >
                            {tarefa.titulo}
                          </span>
                          <Badge variant={prioridadeConfig[tarefa.prioridade].variant}>
                            {prioridadeConfig[tarefa.prioridade].label}
                          </Badge>
                          {tarefa.categoria && (
                            <Badge variant="outline">{tarefa.categoria}</Badge>
                          )}
                          {vencida && (
                            <Badge variant="outline" className="border-blue-500 text-blue-600">Vencida</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[tarefa.status].label}
                          </span>
                          {tarefa.dataVencimento && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(tarefa.dataVencimento)}
                            </span>
                          )}
                          {tarefa.clienteNome && (
                            <span>Cliente: {tarefa.clienteNome}</span>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(tarefa)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(tarefa)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(tarefa.id, "em_progresso")}
                          >
                            Em Progresso
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(tarefa.id, "concluida")}
                          >
                            Marcar como Concluída
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(tarefa.id, "cancelada")}
                            className="text-destructive"
                          >
                            Cancelar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(tarefa.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <TarefaKanban
          tarefas={tarefasFiltradas}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}

      {/* Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedTarefa?.titulo}</SheetTitle>
            <SheetDescription>Detalhes da tarefa</SheetDescription>
          </SheetHeader>
          {selectedTarefa && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={prioridadeConfig[selectedTarefa.prioridade].variant}>
                  {prioridadeConfig[selectedTarefa.prioridade].label}
                </Badge>
                <Badge variant="outline">
                  {statusConfig[selectedTarefa.status].label}
                </Badge>
                {selectedTarefa.categoria && (
                  <Badge variant="secondary">{selectedTarefa.categoria}</Badge>
                )}
                {isVencida(selectedTarefa) && (
                  <Badge variant="destructive">Vencida</Badge>
                )}
              </div>

              <div className="space-y-4">
                {selectedTarefa.descricao && (
                  <div>
                    <Label className="text-muted-foreground">Descrição</Label>
                    <p className="text-sm">{selectedTarefa.descricao}</p>
                  </div>
                )}

                {selectedTarefa.dataVencimento && (
                  <div>
                    <Label className="text-muted-foreground">Data de Vencimento</Label>
                    <p className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(selectedTarefa.dataVencimento)}
                    </p>
                  </div>
                )}

                {selectedTarefa.dataConclusao && (
                  <div>
                    <Label className="text-muted-foreground">Data de Conclusão</Label>
                    <p className="text-sm">
                      {new Date(selectedTarefa.dataConclusao).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}

                {selectedTarefa.responsavel && (
                  <div>
                    <Label className="text-muted-foreground">Responsável</Label>
                    <p className="text-sm">{selectedTarefa.responsavel}</p>
                  </div>
                )}

                {selectedTarefa.clienteNome && (
                  <div>
                    <Label className="text-muted-foreground">Cliente</Label>
                    <p className="text-sm">{selectedTarefa.clienteNome}</p>
                  </div>
                )}

                {selectedTarefa.notas && (
                  <div>
                    <Label className="text-muted-foreground">Notas</Label>
                    <p className="text-sm whitespace-pre-wrap">{selectedTarefa.notas}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Criado por {selectedTarefa.criadoPorNome} em{" "}
                    {new Date(selectedTarefa.criadoEm).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsSheetOpen(false);
                    handleEdit(selectedTarefa);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant={selectedTarefa.status === "concluida" ? "secondary" : "default"}
                  className="flex-1"
                  onClick={() => {
                    handleToggleConcluida(selectedTarefa);
                    setIsSheetOpen(false);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {selectedTarefa.status === "concluida" ? "Reabrir" : "Concluir"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedTarefa.id);
                    setIsSheetOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Tarefas;
