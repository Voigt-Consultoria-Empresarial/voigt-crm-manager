import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building2, Eye, FileText, UserCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Socio {
  id: string;
  nomeCompleto: string;
  documentoCpfCnpj: string;
  listaEmails: string[];
  listaTelefones: string[];
  uf: string;
  endereco: string;
  informacoesExtras: Record<string, any>;
}

interface Contrato {
  id: string;
  servicoNome: string;
  valorDividaBase: number;
  percentualAcordado: number;
  valorHonorarios: number;
  status: string;
  dataContrato: string;
}

interface Empresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  uf: string;
  valorTotalDivida: number;
  valorDividaSelecionada: number;
  naturezaDivida: string;
  statusReceita: string;
  estagioNegociacao: string;
  funcionarioId?: string;
  funcionarioNome?: string;
  informacoesExtras: Record<string, any>;
  socios: Socio[];
  contratos: Contrato[];
  dataConversao: string;
}

const Clientes = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedEmpresas = localStorage.getItem('clientes_empresas');
    if (savedEmpresas) {
      setEmpresas(JSON.parse(savedEmpresas));
    }
  }, []);

  const handleViewEmpresa = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setIsDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'ativo': 'default',
      'em_negociacao': 'secondary',
      'concluido': 'outline',
      'cancelado': 'destructive'
    };
    return variants[status] || 'default';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie empresas convertidas da prospecção
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {empresas.length} {empresas.length === 1 ? 'Cliente' : 'Clientes'}
          </Badge>
        </div>
      </div>

      {empresas.length === 0 ? (
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
              <Building2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
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
      ) : (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-accent" />
              Lista de Empresas
            </CardTitle>
            <CardDescription>
              Empresas convertidas e seus dados cadastrais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Razão Social</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>UF</TableHead>
                  <TableHead>Natureza da Dívida</TableHead>
                  <TableHead className="text-right">Valor Selecionado</TableHead>
                  <TableHead>Sócios</TableHead>
                  <TableHead>Contratos</TableHead>
                  <TableHead>Estágio</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empresas.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold text-foreground">{empresa.razaoSocial}</p>
                        {empresa.nomeFantasia && (
                          <p className="text-xs text-muted-foreground">{empresa.nomeFantasia}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm whitespace-nowrap">{empresa.cnpj}</TableCell>
                    <TableCell>{empresa.uf}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{empresa.naturezaDivida}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(empresa.valorDividaSelecionada)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{empresa.socios.length}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{empresa.contratos.length}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(empresa.estagioNegociacao)}>
                        {empresa.estagioNegociacao}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewEmpresa(empresa)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedEmpresa && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {selectedEmpresa.razaoSocial}
                </DialogTitle>
                <DialogDescription>
                  CNPJ: {selectedEmpresa.cnpj} | Convertido em: {formatDate(selectedEmpresa.dataConversao)}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="geral" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="geral">Geral</TabsTrigger>
                  <TabsTrigger value="socios">Sócios ({selectedEmpresa.socios.length})</TabsTrigger>
                  <TabsTrigger value="contratos">Contratos ({selectedEmpresa.contratos.length})</TabsTrigger>
                  <TabsTrigger value="extras">Informações Extras</TabsTrigger>
                </TabsList>

                <TabsContent value="geral" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Razão Social</label>
                      <p className="text-foreground">{selectedEmpresa.razaoSocial}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nome Fantasia</label>
                      <p className="text-foreground">{selectedEmpresa.nomeFantasia || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">CNPJ</label>
                      <p className="text-foreground font-mono">{selectedEmpresa.cnpj}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">UF</label>
                      <p className="text-foreground">{selectedEmpresa.uf}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Valor Total da Dívida</label>
                      <p className="text-foreground font-semibold">{formatCurrency(selectedEmpresa.valorTotalDivida)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Valor Selecionado</label>
                      <p className="text-foreground font-semibold text-primary">{formatCurrency(selectedEmpresa.valorDividaSelecionada)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Natureza da Dívida</label>
                      <p className="text-foreground">
                        <Badge variant="outline">{selectedEmpresa.naturezaDivida}</Badge>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status na Receita</label>
                      <p className="text-foreground">{selectedEmpresa.statusReceita}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Estágio de Negociação</label>
                      <p className="text-foreground">
                        <Badge variant={getStatusBadge(selectedEmpresa.estagioNegociacao)}>
                          {selectedEmpresa.estagioNegociacao}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="socios" className="space-y-4">
                  {selectedEmpresa.socios.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum sócio cadastrado</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedEmpresa.socios.map((socio) => (
                        <Card key={socio.id} className="border-border">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <UserCircle className="h-4 w-4" />
                              {socio.nomeCompleto}
                            </CardTitle>
                            <CardDescription className="font-mono text-xs">
                              {socio.documentoCpfCnpj}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-muted-foreground">UF:</span> {socio.uf}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Emails:</span> {socio.listaEmails.length}
                              </div>
                            </div>
                            {socio.listaEmails.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">Email(s):</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {socio.listaEmails.map((email, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">{email}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {socio.listaTelefones.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">Telefone(s):</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {socio.listaTelefones.map((tel, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">{tel}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {socio.endereco && (
                              <div>
                                <span className="text-muted-foreground">Endereço:</span>
                                <p className="text-foreground text-xs mt-1">{socio.endereco}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="contratos" className="space-y-4">
                  {selectedEmpresa.contratos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum contrato cadastrado</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedEmpresa.contratos.map((contrato) => (
                        <Card key={contrato.id} className="border-border">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                {contrato.servicoNome}
                              </span>
                              <Badge variant={getStatusBadge(contrato.status)}>
                                {contrato.status}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="text-xs">
                              Contrato de {formatDate(contrato.dataContrato)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-muted-foreground">Valor Base:</span>
                                <p className="font-semibold">{formatCurrency(contrato.valorDividaBase)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">% Acordado:</span>
                                <p className="font-semibold">{contrato.percentualAcordado}%</p>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Valor dos Honorários:</span>
                                <p className="font-semibold text-primary text-lg">
                                  {formatCurrency(contrato.valorHonorarios)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="extras" className="space-y-4">
                  {Object.keys(selectedEmpresa.informacoesExtras).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma informação extra cadastrada</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                        {JSON.stringify(selectedEmpresa.informacoesExtras, null, 2)}
                      </pre>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clientes;
