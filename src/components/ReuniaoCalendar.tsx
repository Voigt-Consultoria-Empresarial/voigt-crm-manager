import { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Video,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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

interface ReuniaoCalendarProps {
  reunioes: Reuniao[];
  onView: (reuniao: Reuniao) => void;
  onEdit: (reuniao: Reuniao) => void;
  onDelete: (id: string) => void;
  onNewReuniao: (date?: string) => void;
}

const statusColors: Record<string, string> = {
  agendada: "bg-blue-500/20 text-blue-700 border-blue-500/30 dark:text-blue-300",
  em_andamento: "bg-amber-500/20 text-amber-700 border-amber-500/30 dark:text-amber-300",
  concluida: "bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-300",
  cancelada: "bg-red-500/20 text-red-700 border-red-500/30 dark:text-red-300",
};

const tipoIcons: Record<string, typeof MapPin> = {
  presencial: MapPin,
  online: Video,
  hibrida: Users,
};

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function ReuniaoCalendar({ 
  reunioes, 
  onView, 
  onEdit, 
  onDelete,
  onNewReuniao 
}: ReuniaoCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startOffset = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    
    // Previous month days
    const prevMonth = new Date(year, month, 0);
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
    
    // Next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }
    
    return days;
  }, [currentDate]);

  const reunioesByDate = useMemo(() => {
    const map: Record<string, Reuniao[]> = {};
    reunioes.forEach((r) => {
      if (!map[r.data]) map[r.data] = [];
      map[r.data].push(r);
    });
    // Sort by time
    Object.keys(map).forEach((date) => {
      map[date].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    });
    return map;
  }, [reunioes]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="bg-card rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={goToPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {/* Day headers */}
        {DAYS.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-muted-foreground border-b bg-muted/30"
          >
            {day}
          </div>
        ))}

        {/* Calendar cells */}
        {calendarDays.map((dayInfo, index) => {
          const dateKey = formatDateKey(dayInfo.date);
          const dayReunioes = reunioesByDate[dateKey] || [];
          const hasMore = dayReunioes.length > 3;
          const displayReunioes = dayReunioes.slice(0, 3);

          return (
            <div
              key={index}
              className={cn(
                "min-h-[120px] p-1 border-b border-r relative group",
                !dayInfo.isCurrentMonth && "bg-muted/20",
                isToday(dayInfo.date) && "bg-accent/10"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                    !dayInfo.isCurrentMonth && "text-muted-foreground",
                    isToday(dayInfo.date) && "bg-primary text-primary-foreground"
                  )}
                >
                  {dayInfo.date.getDate()}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onNewReuniao(dateKey)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-1">
                {displayReunioes.map((reuniao) => {
                  const TipoIcon = tipoIcons[reuniao.tipo];
                  return (
                    <Popover key={reuniao.id}>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "w-full text-left px-1.5 py-0.5 rounded text-xs truncate border",
                            statusColors[reuniao.status]
                          )}
                        >
                          <span className="font-medium">{reuniao.horaInicio}</span>{" "}
                          {reuniao.titulo}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-3" align="start">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{reuniao.titulo}</h4>
                              <p className="text-sm text-muted-foreground">
                                {reuniao.horaInicio}
                                {reuniao.horaFim && ` - ${reuniao.horaFim}`}
                              </p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onView(reuniao)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onEdit(reuniao)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onDelete(reuniao.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <TipoIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">{reuniao.tipo}</span>
                          </div>

                          {reuniao.clienteNome && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Cliente:</span>{" "}
                              {reuniao.clienteNome}
                            </p>
                          )}

                          {reuniao.descricao && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {reuniao.descricao}
                            </p>
                          )}

                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => onView(reuniao)}
                            >
                              Ver detalhes
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  );
                })}

                {hasMore && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-xs text-muted-foreground hover:text-foreground px-1.5">
                        +{dayReunioes.length - 3} mais
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-2" align="start">
                      <div className="space-y-1 max-h-60 overflow-y-auto">
                        {dayReunioes.map((reuniao) => (
                          <button
                            key={reuniao.id}
                            className={cn(
                              "w-full text-left px-2 py-1.5 rounded text-sm border",
                              statusColors[reuniao.status]
                            )}
                            onClick={() => onView(reuniao)}
                          >
                            <span className="font-medium">{reuniao.horaInicio}</span>{" "}
                            {reuniao.titulo}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="p-3 border-t flex items-center gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/30" />
          <span>Agendada</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/30" />
          <span>Em Andamento</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
          <span>Concluída</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
          <span>Cancelada</span>
        </div>
      </div>
    </div>
  );
}
