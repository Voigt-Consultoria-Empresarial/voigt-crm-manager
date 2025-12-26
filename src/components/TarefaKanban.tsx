import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  ListTodo,
  Calendar,
  GripVertical
} from "lucide-react";

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

interface TarefaKanbanProps {
  tarefas: Tarefa[];
  onStatusChange: (id: string, status: Tarefa["status"]) => void;
  onEdit: (tarefa: Tarefa) => void;
  onDelete: (id: string) => void;
  onView: (tarefa: Tarefa) => void;
}

const prioridadeConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  baixa: { label: "Baixa", variant: "secondary" },
  media: { label: "Média", variant: "outline" },
  alta: { label: "Alta", variant: "default" },
  urgente: { label: "Urgente", variant: "destructive" },
};

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pendente: { label: "Pendente", icon: Clock, color: "bg-muted" },
  em_progresso: { label: "Em Progresso", icon: ListTodo, color: "bg-primary/10" },
  concluida: { label: "Concluída", icon: CheckCircle2, color: "bg-green-500/10" },
  cancelada: { label: "Cancelada", icon: AlertCircle, color: "bg-destructive/10" },
};

const statusOrder: Tarefa["status"][] = ["pendente", "em_progresso", "concluida", "cancelada"];

const TarefaKanban = ({ tarefas, onStatusChange, onEdit, onDelete, onView }: TarefaKanbanProps) => {
  const formatDate = (date: string) => {
    return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
  };

  const isVencida = (tarefa: Tarefa) => {
    if (!tarefa.dataVencimento) return false;
    const hoje = new Date().toISOString().split("T")[0];
    return tarefa.dataVencimento < hoje && tarefa.status !== "concluida" && tarefa.status !== "cancelada";
  };

  const getTarefasByStatus = (status: Tarefa["status"]) => {
    return tarefas.filter((t) => t.status === status);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceStatus = result.source.droppableId as Tarefa["status"];
    const destStatus = result.destination.droppableId as Tarefa["status"];
    
    if (sourceStatus === destStatus) return;
    
    const tarefaId = result.draggableId;
    onStatusChange(tarefaId, destStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusOrder.map((status) => {
          const config = statusConfig[status];
          const StatusIcon = config.icon;
          const tarefasDoStatus = getTarefasByStatus(status);

          return (
            <div key={status} className="flex flex-col">
              <Card className={`${config.color} border-t-4 border-t-accent`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon className="h-4 w-4" />
                      {config.label}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {tarefasDoStatus.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>
              
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-h-[200px] mt-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? "bg-accent/20 ring-2 ring-accent ring-dashed" : ""
                    }`}
                  >
                    <div className="space-y-2">
                      {tarefasDoStatus.map((tarefa, index) => {
                        const vencida = isVencida(tarefa);
                        
                        return (
                          <Draggable key={tarefa.id} draggableId={tarefa.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`group transition-all ${
                                  snapshot.isDragging ? "shadow-lg ring-2 ring-primary rotate-2" : ""
                                } ${vencida ? "border-destructive bg-destructive/5" : ""} ${
                                  tarefa.status === "concluida" ? "opacity-70" : ""
                                }`}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-2">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      <GripVertical className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <p className={`font-medium text-sm leading-tight ${
                                          tarefa.status === "concluida" ? "line-through text-muted-foreground" : ""
                                        }`}>
                                          {tarefa.titulo}
                                        </p>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                              <MoreHorizontal className="h-3 w-3" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onView(tarefa)}>
                                              <Eye className="h-4 w-4 mr-2" />
                                              Visualizar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit(tarefa)}>
                                              <Edit className="h-4 w-4 mr-2" />
                                              Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() => onDelete(tarefa.id)}
                                              className="text-destructive"
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              Excluir
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                      
                                      <div className="flex flex-wrap items-center gap-1 mt-2">
                                        <Badge 
                                          variant={prioridadeConfig[tarefa.prioridade].variant}
                                          className="text-xs px-1.5 py-0"
                                        >
                                          {prioridadeConfig[tarefa.prioridade].label}
                                        </Badge>
                                        {tarefa.categoria && (
                                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                                            {tarefa.categoria}
                                          </Badge>
                                        )}
                                        {vencida && (
                                          <Badge variant="destructive" className="text-xs px-1.5 py-0">
                                            Vencida
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                        {tarefa.dataVencimento && (
                                          <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(tarefa.dataVencimento)}
                                          </span>
                                        )}
                                      </div>
                                      
                                      {tarefa.clienteNome && (
                                        <p className="text-xs text-muted-foreground mt-1 truncate">
                                          {tarefa.clienteNome}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default TarefaKanban;
