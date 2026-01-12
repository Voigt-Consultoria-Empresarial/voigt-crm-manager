import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Flame, 
  FileCheck, 
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { format, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: "baixa" | "media" | "alta" | "urgente";
  status: "pendente" | "em_progresso" | "concluida" | "cancelada";
  categoria: string;
  dataVencimento: string;
  dataCriacao: string;
  clienteId?: string;
  clienteNome?: string;
  responsavelId?: string;
  notas: string;
}

interface Reuniao {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  horario: string;
  duracao: string;
  tipo: "presencial" | "video" | "telefone";
  participantes: string;
  clienteId?: string;
  clienteNome?: string;
  local?: string;
  link?: string;
  status: "agendada" | "confirmada" | "em_andamento" | "concluida" | "cancelada" | "reagendada";
  notas: string;
}

interface Lead {
  id: string;
  empresa: string;
  temperatura: "quente" | "morno" | "frio";
  status: string;
  valorEstimado: number;
}

interface Meta {
  id: string;
  titulo: string;
  tipo: "individual" | "setor";
  valorAlvo: number;
  valorAtual: number;
  status: "em_andamento" | "concluida" | "atrasada";
}

interface Contrato {
  id: string;
  status: string;
}

const prioridadeConfig = {
  baixa: { label: "Baixa", variant: "secondary" as const },
  media: { label: "Média", variant: "default" as const },
  alta: { label: "Alta", variant: "destructive" as const },
  urgente: { label: "Urgente", variant: "destructive" as const },
};

const statusReuniaoConfig = {
  agendada: { label: "Agendada", variant: "outline" as const },
  confirmada: { label: "Confirmada", variant: "default" as const },
  em_andamento: { label: "Em Andamento", variant: "default" as const },
  concluida: { label: "Concluída", variant: "secondary" as const },
  cancelada: { label: "Cancelada", variant: "destructive" as const },
  reagendada: { label: "Reagendada", variant: "outline" as const },
};

const Home = () => {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);

  useEffect(() => {
    const savedTarefas = localStorage.getItem("tarefas");
    if (savedTarefas) setTarefas(JSON.parse(savedTarefas));

    const savedReunioes = localStorage.getItem("reunioes");
    if (savedReunioes) setReunioes(JSON.parse(savedReunioes));

    const savedLeads = localStorage.getItem("leads_data");
    if (savedLeads) setLeads(JSON.parse(savedLeads));

    const savedMetas = localStorage.getItem("metas_data");
    if (savedMetas) setMetas(JSON.parse(savedMetas));

    const savedClientes = localStorage.getItem("clientes_empresas");
    if (savedClientes) setClientes(JSON.parse(savedClientes));

    const savedContratos = localStorage.getItem("contratos_data");
    if (savedContratos) setContratos(JSON.parse(savedContratos));
  }, []);

  const stats = useMemo(() => {
    const totalClientes = clientes.length;
    const valorTotalDivida = clientes.reduce((acc, c) => acc + (c.valorDivida || 0), 0);
    
    const leadsQuentes = leads.filter(l => l.temperatura === "quente").length;
    const leadsMornos = leads.filter(l => l.temperatura === "morno").length;
    const totalLeads = leads.length;
    
    const metasEmAndamento = metas.filter(m => m.status === "em_andamento").length;
    const metasConcluidas = metas.filter(m => m.status === "concluida").length;
    const progressoMetas = metas.length > 0 
      ? Math.round((metas.reduce((acc, m) => acc + (m.valorAtual / m.valorAlvo) * 100, 0)) / metas.length)
      : 0;
    
    const contratosPendentes = contratos.filter(c => c.status === "pendente" || c.status === "em_analise").length;
    const contratosAtivos = contratos.filter(c => c.status === "ativo").length;
    
    const tarefasPendentes = tarefas.filter(t => t.status === "pendente" || t.status === "em_progresso").length;
    const reunioesAgendadas = reunioes.filter(r => r.status === "agendada" || r.status === "confirmada").length;

    return {
      totalClientes,
      valorTotalDivida,
      leadsQuentes,
      leadsMornos,
      totalLeads,
      metasEmAndamento,
      metasConcluidas,
      progressoMetas,
      contratosPendentes,
      contratosAtivos,
      tarefasPendentes,
      reunioesAgendadas,
    };
  }, [clientes, leads, metas, contratos, tarefas, reunioes]);

  const tarefasHoje = useMemo(() => {
    return tarefas
      .filter(t => {
        if (!t.dataVencimento) return false;
        try {
          return isToday(parseISO(t.dataVencimento)) && t.status !== "concluida" && t.status !== "cancelada";
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        const prioridadeOrder = { urgente: 0, alta: 1, media: 2, baixa: 3 };
        return prioridadeOrder[a.prioridade] - prioridadeOrder[b.prioridade];
      });
  }, [tarefas]);

  const reunioesHoje = useMemo(() => {
    const hoje = format(new Date(), "yyyy-MM-dd");
    return reunioes
      .filter(r => r.data === hoje && r.status !== "cancelada" && r.status !== "concluida")
      .sort((a, b) => a.horario.localeCompare(b.horario));
  }, [reunioes]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const statCards = [
    {
      title: "Clientes Ativos",
      value: stats.totalClientes.toString(),
      icon: Users,
      description: "Total de clientes",
      color: "text-blue-500",
    },
    {
      title: "Valor em Carteira",
      value: formatCurrency(stats.valorTotalDivida),
      icon: DollarSign,
      description: "Soma das dívidas",
      color: "text-green-500",
    },
    {
      title: "Leads Quentes",
      value: stats.leadsQuentes.toString(),
      icon: Flame,
      description: `${stats.totalLeads} leads no total`,
      color: "text-orange-500",
    },
    {
      title: "Progresso de Metas",
      value: `${stats.progressoMetas}%`,
      icon: Target,
      description: `${stats.metasConcluidas} concluídas`,
      color: "text-purple-500",
    },
    {
      title: "Contratos Pendentes",
      value: stats.contratosPendentes.toString(),
      icon: FileCheck,
      description: `${stats.contratosAtivos} ativos`,
      color: "text-amber-500",
    },
    {
      title: "Tarefas Pendentes",
      value: stats.tarefasPendentes.toString(),
      icon: Clock,
      description: "Aguardando conclusão",
      color: "text-red-500",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do sistema de gestão - {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tarefas e Reuniões do Dia */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tarefas de Hoje */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Tarefas de Hoje
              </CardTitle>
              <CardDescription>
                {tarefasHoje.length} tarefa{tarefasHoje.length !== 1 ? "s" : ""} para hoje
              </CardDescription>
            </div>
            <Link to="/tarefas">
              <Button variant="ghost" size="sm" className="gap-1">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              {tarefasHoje.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <CheckCircle2 className="h-12 w-12 mb-2 opacity-20" />
                  <p>Nenhuma tarefa para hoje</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tarefasHoje.map((tarefa) => (
                    <div
                      key={tarefa.id}
                      className="flex items-start justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {tarefa.titulo}
                        </p>
                        {tarefa.clienteNome && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {tarefa.clienteNome}
                          </p>
                        )}
                        {tarefa.descricao && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {tarefa.descricao}
                          </p>
                        )}
                      </div>
                      <Badge variant={prioridadeConfig[tarefa.prioridade].variant} className="ml-2 shrink-0">
                        {prioridadeConfig[tarefa.prioridade].label}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Reuniões de Hoje */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Reuniões de Hoje
              </CardTitle>
              <CardDescription>
                {reunioesHoje.length} reuniã{reunioesHoje.length !== 1 ? "es" : "o"} agendada{reunioesHoje.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Link to="/reunioes">
              <Button variant="ghost" size="sm" className="gap-1">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              {reunioesHoje.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <Calendar className="h-12 w-12 mb-2 opacity-20" />
                  <p>Nenhuma reunião para hoje</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reunioesHoje.map((reuniao) => (
                    <div
                      key={reuniao.id}
                      className="flex items-start justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-primary">
                            {reuniao.horario}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({reuniao.duracao})
                          </span>
                        </div>
                        <p className="font-medium text-sm text-foreground mt-1 truncate">
                          {reuniao.titulo}
                        </p>
                        {reuniao.clienteNome && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {reuniao.clienteNome}
                          </p>
                        )}
                        {reuniao.participantes && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {reuniao.participantes}
                          </p>
                        )}
                      </div>
                      <Badge variant={statusReuniaoConfig[reuniao.status].variant} className="ml-2 shrink-0">
                        {statusReuniaoConfig[reuniao.status].label}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions / Info Card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-accent" />
            Resumo Rápido
          </CardTitle>
          <CardDescription>
            Informações importantes do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-medium">Leads</span>
              </div>
              <p className="text-sm">
                <span className="font-bold text-orange-500">{stats.leadsQuentes}</span> quentes, 
                <span className="font-bold text-yellow-500 ml-1">{stats.leadsMornos}</span> mornos
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-medium">Metas</span>
              </div>
              <p className="text-sm">
                <span className="font-bold text-purple-500">{stats.metasEmAndamento}</span> em andamento, 
                <span className="font-bold text-green-500 ml-1">{stats.metasConcluidas}</span> concluídas
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <FileCheck className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium">Contratos</span>
              </div>
              <p className="text-sm">
                <span className="font-bold text-amber-500">{stats.contratosPendentes}</span> pendentes, 
                <span className="font-bold text-green-500 ml-1">{stats.contratosAtivos}</span> ativos
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium">Agenda</span>
              </div>
              <p className="text-sm">
                <span className="font-bold text-blue-500">{stats.reunioesAgendadas}</span> reuniões agendadas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
