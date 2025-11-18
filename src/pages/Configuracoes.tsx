import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

const Configuracoes = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as configurações do sistema
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-accent" />
            Configurações do Sistema
          </CardTitle>
          <CardDescription>
            Configure preferências e parâmetros do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Settings className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg text-foreground mb-2">
              Em desenvolvimento
            </h3>
            <p className="text-muted-foreground text-sm max-w-md">
              As configurações do sistema estarão disponíveis em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;
