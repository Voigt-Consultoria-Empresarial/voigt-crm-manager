import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Servicos = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Serviços</h1>
        <p className="text-muted-foreground mt-1">
          Cadastre e gerencie os serviços oferecidos
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Tipos de Serviços</CardTitle>
          <CardDescription>
            Configure serviços, percentuais de negociação e descrições
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Servicos;
