import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, TrendingUp, DollarSign } from "lucide-react";

const Home = () => {
  const stats = [
    {
      title: "Total de Devedores",
      value: "0",
      icon: FileText,
      description: "Registros importados",
    },
    {
      title: "Clientes Ativos",
      value: "0",
      icon: Users,
      description: "Convertidos da prospecção",
    },
    {
      title: "Valor Total",
      value: "R$ 0,00",
      icon: DollarSign,
      description: "Soma das dívidas",
    },
    {
      title: "Taxa de Conversão",
      value: "0%",
      icon: TrendingUp,
      description: "Prospecção → Clientes",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do sistema de gestão de devedores
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Bem-vindo ao Sistema Voigt</CardTitle>
          <CardDescription>
            Sistema de gestão de lista de devedores PGFN
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Este sistema permite importar, visualizar e gerenciar listas de devedores 
            da Procuradoria-Geral da Fazenda Nacional (PGFN).
          </p>
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-foreground">Funcionalidades principais:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Importação de planilhas de devedores</li>
              <li>Visualização de metadados e filtros aplicados</li>
              <li>Gestão completa de prospecção com CRUD</li>
              <li>Conversão de prospects para clientes</li>
              <li>Paginação e busca avançada</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
