import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Contratos = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Contratos</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie contratos de serviços com clientes
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Lista de Contratos</CardTitle>
          <CardDescription>
            Contratos ativos e histórico de negociações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contratos;
