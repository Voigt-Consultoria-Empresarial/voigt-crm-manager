import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Funcionarios = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Funcionários</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie a equipe e suas carteiras de clientes
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Equipe</CardTitle>
          <CardDescription>
            Funcionários, cargos e atribuições
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Funcionarios;
