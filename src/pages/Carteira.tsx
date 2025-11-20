import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Carteira = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Carteira de Clientes</h1>
        <p className="text-muted-foreground mt-1">
          Visualize e gerencie a distribuição de clientes por funcionário
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Distribuição de Carteira</CardTitle>
          <CardDescription>
            Acompanhe o atendimento e distribuição de clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Carteira;
