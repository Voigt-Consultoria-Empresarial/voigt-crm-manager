import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Calendar,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Clock,
  Users,
  MapPin,
  Video,
  Filter,
  X,
  Search,
  LayoutList,
  CalendarDays
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ReuniaoCalendar } from "@/components/ReuniaoCalendar";

interface Reuniao {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipo: "presencial" | "online" | "hibrida";
  local?: string;
  linkOnline?: string;
  participantes: string[];
  status: "agendada" | "em_andamento" | "concluida" | "cancelada";
  clienteId?: string;
  clienteNome?: string;
  notas?: string;
  criadoPor: string;
  criadoPorNome: string;
  criadoEm: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  agendada: { label: "Agendada", variant: "secondary" },
  em_andamento: { label: "Em Andamento", variant: "default" },
  concluida: { label: "Concluída", variant: "outline" },
  cancelada: { label: "Cancelada", variant: "outline" },
};

const tipoConfig: Record<string, { label: string; icon: typeof MapPin }> = {
  presencial: { label: "Presencial", icon: MapPin },
  online: { label: "Online", icon: Video },
  hibrida: { label: "Híbrida", icon: Users },
};

const Reunioes = () => {
  const { toast } = useToast();
  const { funcionario } = useAuth();

  const [reunioes, setReunioes] = useState<Reuniao[]>(() => {
    const saved = localStorage.getItem("reunioes");
    return saved ? JSON.parse(saved) : [];
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedReuniao, setSelectedReuniao] = useState<Reuniao | null>(null);
  const [editingReuniao, setEditingReuniao] = useState<Reuniao | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"lista" | "calendario">("lista");

  const [filters, setFilters] = useState({
    busca: "",
    status: "todos",
    tipo: "todos",
    dataInicio: "",
    dataFim: "",
  });

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data: "",
    horaInicio: "",
    horaFim: "",
    tipo: "presencial" as "presencial" | "online" | "hibrida",
    local: "",
    linkOnline: "",
    participantes: "",
    clienteNome: "",
    notas: "",
  });

  const saveToLocalStorage = (data: Reuniao[]) => {
    localStorage.setItem("reunioes", JSON.stringify(data));
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      descricao: "",
      data: "",
      horaInicio: "",
      horaFim: "",
      tipo: "presencial",
      local: "",
      linkOnline: "",
      participantes: "",
      clienteNome: "",
      notas: "",
    });
    setEditingReuniao(null);
  };

  const handleSubmit = () => {
    if (!formData.titulo || !formData.data || !formData.horaInicio) {
      toast({
        title: "Erro",
        description: "Preencha os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const participantesArray = formData.participantes
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);

    if (editingReuniao) {
      const updated = reunioes.map((r) =>
        r.id === editingReuniao.id
          ? {
            ...r,
            ...formData,
            participantes: participantesArray,
          }
          : r
      );
      setReunioes(updated);
      saveToLocalStorage(updated);
      toast({ title: "Reunião atualizada com sucesso" });
    } else {
      const newReuniao: Reuniao = {
        id: crypto.randomUUID(),
        titulo: formData.titulo,
        descricao: formData.descricao,
        data: formData.data,
        horaInicio: formData.horaInicio,
        horaFim: formData.horaFim,
        tipo: formData.tipo,
        local: formData.local,
        linkOnline: formData.linkOnline,
        participantes: participantesArray,
        status: "agendada",
        clienteNome: formData.clienteNome,
        notas: formData.notas,
        criadoPor: funcionario?.id || "",
        criadoPorNome: funcionario?.nome || "",
        criadoEm: new Date().toISOString(),
      };
      const updated = [...reunioes, newReuniao];
      setReunioes(updated);
      saveToLocalStorage(updated);
      toast({ title: "Reunião criada com sucesso" });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (reuniao: Reuniao) => {
    setEditingReuniao(reuniao);
    setFormData({
      titulo: reuniao.titulo,
      descricao: reuniao.descricao,
      data: reuniao.data,
      horaInicio: reuniao.horaInicio,
      horaFim: reuniao.horaFim || "",
      tipo: reuniao.tipo,
      local: reuniao.local || "",
      linkOnline: reuniao.linkOnline || "",
      participantes: reuniao.participantes.join(", "),
      clienteNome: reuniao.clienteNome || "",
      notas: reuniao.notas || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = reunioes.filter((r) => r.id !== id);
    setReunioes(updated);
    saveToLocalStorage(updated);
    toast({ title: "Reunião excluída" });
  };

  const handleStatusChange = (id: string, status: Reuniao["status"]) => {
    const updated = reunioes.map((r) =>
      r.id === id ? { ...r, status } : r
    );
    setReunioes(updated);
    saveToLocalStorage(updated);
    toast({ title: "Status atualizado" });
  };

  const handleView = (reuniao: Reuniao) => {
    setSelectedReuniao(reuniao);
    setIsSheetOpen(true);
  };

  const handleNewReuniaoFromCalendar = (date?: string) => {
    resetForm();
    if (date) {
      setFormData(prev => ({ ...prev, data: date }));
    }
    setIsDialogOpen(true);
  };

  const clearFilters = () => {
    setFilters({
      busca: "",
      status: "todos",
      tipo: "todos",
      dataInicio: "",
      dataFim: "",
    });
  };

  const reunioesFiltradas = useMemo(() => {
    return reunioes.filter((r) => {
      if (filters.busca) {
        const busca = filters.busca.toLowerCase();
        if (
          !r.titulo.toLowerCase().includes(busca) &&
          !r.descricao.toLowerCase().includes(busca) &&
          !r.clienteNome?.toLowerCase().includes(busca)
        ) {
          return false;
        }
      }
      if (filters.status !== "todos" && r.status !== filters.status) return false;
      if (filters.tipo !== "todos" && r.tipo !== filters.tipo) return false;
      if (filters.dataInicio && r.data < filters.dataInicio) return false;
      if (filters.dataFim && r.data > filters.dataFim) return false;
      return true;
    });
  }, [reunioes, filters]);

  const stats = useMemo(() => {
    const hoje = new Date().toISOString().split("T")[0];
    return {
      total: reunioes.length,
      agendadas: reunioes.filter((r) => r.status === "agendada").length,
      hoje: reunioes.filter((r) => r.data === hoje).length,
      concluidas: reunioes.filter((r) => r.status === "concluida").length,
    };
  }, [reunioes]);

  const formatDate = (date: string) => {
    return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reuniões</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas reuniões e compromissos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Reunião
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReuniao ? "Editar Reunião" : "Nova Reunião"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados da reunião
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
                  placeholder="Título da reunião"
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
                  placeholder="Descrição da reunião"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) =>
                      setFormData({ ...formData, data: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="horaInicio">Início *</Label>
                  <Input
                    id="horaInicio"
                    type="time"
                    value={formData.horaInicio}
                    onChange={(e) =>
                      setFormData({ ...formData, horaInicio: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="horaFim">Fim</Label>
                  <Input
                    id="horaFim"
                    type="time"
                    value={formData.horaFim}
                    onChange={(e) =>
                      setFormData({ ...formData, horaFim: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: "presencial" | "online" | "hibrida") =>
                    setFormData({ ...formData, tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="hibrida">Híbrida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(formData.tipo === "presencial" || formData.tipo === "hibrida") && (
                <div className="grid gap-2">
                  <Label htmlFor="local">Local</Label>
                  <Input
                    id="local"
                    value={formData.local}
                    onChange={(e) =>
                      setFormData({ ...formData, local: e.target.value })
                    }
                    placeholder="Endereço ou sala"
                  />
                </div>
              )}
              {(formData.tipo === "online" || formData.tipo === "hibrida") && (
                <div className="grid gap-2">
                  <Label htmlFor="linkOnline">Link da Reunião</Label>
                  <Input
                    id="linkOnline"
                    value={formData.linkOnline}
                    onChange={(e) =>
                      setFormData({ ...formData, linkOnline: e.target.value })
                    }
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="participantes">Participantes</Label>
                <Input
                  id="participantes"
                  value={formData.participantes}
                  onChange={(e) =>
                    setFormData({ ...formData, participantes: e.target.value })
                  }
                  placeholder="Separados por vírgula"
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
                {editingReuniao ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Agendadas
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agendadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hoje}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Concluídas
            </CardTitle>
            <Users className="h-4 w-4 text-blue-800" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.concluidas}</div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Toggle and Filters */}
      <div className="flex items-center justify-between gap-4">
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => value && setViewMode(value as "lista" | "calendario")}
          className="bg-muted p-1 rounded-lg"
        >
          <ToggleGroupItem value="lista" aria-label="Modo Lista" className="gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            <LayoutList className="h-4 w-4" />
            Lista
          </ToggleGroupItem>
          <ToggleGroupItem value="calendario" aria-label="Modo Calendário" className="gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            <CalendarDays className="h-4 w-4" />
            Calendário
          </ToggleGroupItem>
        </ToggleGroup>

        {viewMode === "lista" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        )}
      </div>

      {/* Calendar View */}
      {viewMode === "calendario" && (
        <ReuniaoCalendar
          reunioes={reunioes}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onNewReuniao={handleNewReuniaoFromCalendar}
        />
      )}

      {/* List View */}
      {viewMode === "lista" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Lista de Reuniões</CardTitle>
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
                    <SelectItem value="agendada">Agendada</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.tipo}
                  onValueChange={(v) => setFilters({ ...filters, tipo: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="hibrida">Híbrida</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={filters.dataInicio}
                  onChange={(e) =>
                    setFilters({ ...filters, dataInicio: e.target.value })
                  }
                  placeholder="Data início"
                />
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={filters.dataFim}
                    onChange={(e) =>
                      setFilters({ ...filters, dataFim: e.target.value })
                    }
                    placeholder="Data fim"
                  />
                  <Button variant="ghost" size="icon" onClick={clearFilters}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
          <CardContent>
            {reunioesFiltradas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma reunião encontrada
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reunioesFiltradas.map((reuniao) => {
                    const TipoIcon = tipoConfig[reuniao.tipo].icon;
                    return (
                      <TableRow key={reuniao.id}>
                        <TableCell className="font-medium">
                          {reuniao.titulo}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(reuniao.data)} às {reuniao.horaInicio}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TipoIcon className="h-4 w-4 text-muted-foreground" />
                            {tipoConfig[reuniao.tipo].label}
                          </div>
                        </TableCell>
                        <TableCell>{reuniao.clienteNome || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[reuniao.status].variant}>
                            {statusConfig[reuniao.status].label}
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
                              <DropdownMenuItem onClick={() => handleView(reuniao)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(reuniao)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(reuniao.id, "concluida")}
                              >
                                Marcar como Concluída
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(reuniao.id, "cancelada")}
                                className="text-destructive"
                              >
                                Cancelar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(reuniao.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedReuniao?.titulo}</SheetTitle>
            <SheetDescription>Detalhes da reunião</SheetDescription>
          </SheetHeader>
          {selectedReuniao && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-2">
                <Badge variant={statusConfig[selectedReuniao.status].variant}>
                  {statusConfig[selectedReuniao.status].label}
                </Badge>
                <Badge variant="outline">
                  {tipoConfig[selectedReuniao.tipo].label}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Data e Hora</Label>
                  <p className="text-sm">
                    {formatDate(selectedReuniao.data)} • {selectedReuniao.horaInicio}
                    {selectedReuniao.horaFim && ` - ${selectedReuniao.horaFim}`}
                  </p>
                </div>

                {selectedReuniao.descricao && (
                  <div>
                    <Label className="text-muted-foreground">Descrição</Label>
                    <p className="text-sm">{selectedReuniao.descricao}</p>
                  </div>
                )}

                {selectedReuniao.local && (
                  <div>
                    <Label className="text-muted-foreground">Local</Label>
                    <p className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedReuniao.local}
                    </p>
                  </div>
                )}

                {selectedReuniao.linkOnline && (
                  <div>
                    <Label className="text-muted-foreground">Link Online</Label>
                    <a
                      href={selectedReuniao.linkOnline}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent hover:underline flex items-center gap-2"
                    >
                      <Video className="h-4 w-4" />
                      Acessar reunião
                    </a>
                  </div>
                )}

                {selectedReuniao.clienteNome && (
                  <div>
                    <Label className="text-muted-foreground">Cliente</Label>
                    <p className="text-sm">{selectedReuniao.clienteNome}</p>
                  </div>
                )}

                {selectedReuniao.participantes.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Participantes</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedReuniao.participantes.map((p, i) => (
                        <Badge key={i} variant="secondary">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReuniao.notas && (
                  <div>
                    <Label className="text-muted-foreground">Notas</Label>
                    <p className="text-sm whitespace-pre-wrap">{selectedReuniao.notas}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Criado por {selectedReuniao.criadoPorNome} em{" "}
                    {new Date(selectedReuniao.criadoEm).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsSheetOpen(false);
                    handleEdit(selectedReuniao);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedReuniao.id);
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

export default Reunioes;
