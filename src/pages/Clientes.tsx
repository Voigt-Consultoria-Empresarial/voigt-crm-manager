import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const Clientes = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seus clientes convertidos da prospecção
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Lista de Clientes
          </CardTitle>
          <CardDescription>
            Nenhum cliente cadastrado ainda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg text-foreground mb-2">
              Nenhum cliente cadastrado
            </h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Converta devedores da lista de prospecção para clientes usando a opção 
              "Adicionar aos Clientes" disponível na página de Prospecção.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Clientes;
