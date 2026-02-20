import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building2, Eye, FileText, UserCircle, Info, Copy, Check, MessageCircle } from "lucide-react";
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

interface AtividadeEconomica {
  code: string;
  text: string;
}

interface Simples {
  optante: boolean;
  data_opcao?: string;
  data_exclusao?: string;
  ultima_atualizacao?: string;
}

interface QSA {
  nome: string;
  qual: string;
  pais_origem?: string;
  nome_rep_legal?: string;
  qual_rep_legal?: string;
}

interface DadosReceitaWS {
  ultima_atualizacao?: string;
  tipo?: string;
  porte?: string;
  abertura?: string;
  atividade_principal?: AtividadeEconomica[];
  atividades_secundarias?: AtividadeEconomica[];
  natureza_juridica?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  cep?: string;
  bairro?: string;
  municipio?: string;
  email?: string;
  telefone?: string;
  efr?: string;
  situacao?: string;
  data_situacao?: string;
  motivo_situacao?: string;
  situacao_especial?: string;
  data_situacao_especial?: string;
  capital_social?: string;
  qsa?: QSA[];
  simples?: Simples;
  simei?: Simples;
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
  dadosReceitaWS?: DadosReceitaWS;
  socios: Socio[];
  contratos: Contrato[];
  dataConversao: string;
}

const Clientes = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedEmpresas = localStorage.getItem('clientes_empresas');
    if (savedEmpresas) {
      setEmpresas(JSON.parse(savedEmpresas));
    }
  }, []);

  const handleViewEmpresa = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setIsSheetOpen(true);
  };

  const handleCopyPhone = (phone: string) => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    navigator.clipboard.writeText(cleanPhone);
    setCopiedPhone(phone);
    toast({
      title: "Copiado!",
      description: "Telefone copiado para a área de transferência.",
    });
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleOpenWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
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
      'cancelado': 'outline'
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
              <Users className="h-5 w-5 text-blue-600" />
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
              <Building2 className="h-5 w-5 text-blue-500" />
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

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
          {selectedEmpresa && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {selectedEmpresa.razaoSocial}
                </SheetTitle>
                <SheetDescription>
                  CNPJ: {selectedEmpresa.cnpj} | Convertido em: {formatDate(selectedEmpresa.dataConversao)}
                </SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="geral" className="w-full mt-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="geral">Geral</TabsTrigger>
                  <TabsTrigger value="socios">Sócios</TabsTrigger>
                  <TabsTrigger value="receita">Receita Federal</TabsTrigger>
                  <TabsTrigger value="contratos">Contratos ({selectedEmpresa.contratos.length})</TabsTrigger>
                  <TabsTrigger value="extras">Informações Extras</TabsTrigger>
                </TabsList>

                <TabsContent value="geral" className="space-y-4">
                  {selectedEmpresa.informacoesExtras?.adicionadoPor && (
                    <Card className="bg-muted/50 border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <UserCircle className="h-4 w-4" />
                          Adicionado por
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1">
                        <p className="text-foreground font-medium">
                          {selectedEmpresa.informacoesExtras.adicionadoPor.funcionarioNome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedEmpresa.informacoesExtras.adicionadoPor.funcionarioCargo}
                        </p>
                      </CardContent>
                    </Card>
                  )}
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
                      <div className="text-foreground">
                        <Badge variant="outline">{selectedEmpresa.naturezaDivida}</Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status na Receita</label>
                      <p className="text-foreground">{selectedEmpresa.statusReceita}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Estágio de Negociação</label>
                      <div className="text-foreground">
                        <Badge variant={getStatusBadge(selectedEmpresa.estagioNegociacao)}>
                          {selectedEmpresa.estagioNegociacao}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="socios" className="space-y-4">
                  {selectedEmpresa.dadosReceitaWS?.qsa && selectedEmpresa.dadosReceitaWS.qsa.length > 0 ? (
                    <div className="space-y-4">
                      {/* Contatos dos Sócios */}
                      {selectedEmpresa.dadosReceitaWS.telefone && (
                        <Card className="border-border">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Contatos dos Sócios</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-foreground">{selectedEmpresa.dadosReceitaWS.telefone}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyPhone(selectedEmpresa.dadosReceitaWS!.telefone!)}
                                >
                                  {copiedPhone === selectedEmpresa.dadosReceitaWS.telefone ? (
                                    <Check className="h-4 w-4 text-blue-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenWhatsApp(selectedEmpresa.dadosReceitaWS!.telefone!)}
                                >
                                  <MessageCircle className="h-4 w-4 text-blue-600" />
                                </Button>
                              </div>
                            </div>
                            {selectedEmpresa.dadosReceitaWS.email && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">E-mail</label>
                                <p className="text-foreground">{selectedEmpresa.dadosReceitaWS.email}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Lista de Sócios */}
                      <Card className="border-border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Quadro Societário (QSA)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {selectedEmpresa.dadosReceitaWS.qsa.map((socio, index) => (
                              <div key={index} className="border-l-2 border-primary/30 pl-4 py-2">
                                <p className="font-semibold text-foreground">{socio.nome}</p>
                                <p className="text-sm text-muted-foreground">{socio.qual}</p>
                                {socio.pais_origem && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    País de Origem: {socio.pais_origem}
                                  </p>
                                )}
                                {socio.nome_rep_legal && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    <p>Representante Legal: {socio.nome_rep_legal}</p>
                                    {socio.qual_rep_legal && (
                                      <p>Qualificação: {socio.qual_rep_legal}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum sócio cadastrado</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="receita" className="space-y-4">
                  {!selectedEmpresa.dadosReceitaWS ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Dados da Receita Federal não disponíveis</p>
                      <p className="text-xs mt-2">Esta empresa foi adicionada antes da implementação da consulta automática</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Dados Cadastrais */}
                      <Card className="border-border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Dados Cadastrais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            {selectedEmpresa.dadosReceitaWS.tipo && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                                <p className="text-foreground">{selectedEmpresa.dadosReceitaWS.tipo}</p>
                              </div>
                            )}
                            {selectedEmpresa.dadosReceitaWS.porte && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Porte</label>
                                <p className="text-foreground">{selectedEmpresa.dadosReceitaWS.porte}</p>
                              </div>
                            )}
                            {selectedEmpresa.dadosReceitaWS.abertura && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Data de Abertura</label>
                                <p className="text-foreground">{selectedEmpresa.dadosReceitaWS.abertura}</p>
                              </div>
                            )}
                            {selectedEmpresa.dadosReceitaWS.natureza_juridica && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Natureza Jurídica</label>
                                <p className="text-foreground text-sm">{selectedEmpresa.dadosReceitaWS.natureza_juridica}</p>
                              </div>
                            )}
                            {selectedEmpresa.dadosReceitaWS.capital_social && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Capital Social</label>
                                <p className="text-foreground">{selectedEmpresa.dadosReceitaWS.capital_social}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Situação */}
                      <Card className="border-border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Situação Cadastral</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            {selectedEmpresa.dadosReceitaWS.situacao && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Situação</label>
                                <Badge variant={selectedEmpresa.dadosReceitaWS.situacao === 'ATIVA' ? 'default' : 'outline'}>
                                  {selectedEmpresa.dadosReceitaWS.situacao}
                                </Badge>
                              </div>
                            )}
                            {selectedEmpresa.dadosReceitaWS.data_situacao && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Data da Situação</label>
                                <p className="text-foreground">{selectedEmpresa.dadosReceitaWS.data_situacao}</p>
                              </div>
                            )}
                            {selectedEmpresa.dadosReceitaWS.motivo_situacao && (
                              <div className="col-span-2">
                                <label className="text-sm font-medium text-muted-foreground">Motivo</label>
                                <p className="text-foreground">{selectedEmpresa.dadosReceitaWS.motivo_situacao}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Endereço */}
                      <Card className="border-border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Endereço</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            {selectedEmpresa.dadosReceitaWS.logradouro && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Logradouro</label>
                                <p className="text-foreground">{selectedEmpresa.dadosReceitaWS.logradouro}</p>
                              </div>
                            )}
                            {selectedEmpresa.dadosReceitaWS.numero && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Número</label>
                                <p className="text-foreground">{selectedEmpresa.dadosReceitaWS.numero}</p>
                              </div>
                            )}
                            {selectedEmpresa.dadosReceitaWS.complemento && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Complemento</label>
                                <p className="text-foreground">{selectedEmpresa.dadosReceitaWS.complemento}</p>
                              </div>
                            )}
                            {selectedEmpresa.dadosReceitaWS.bairro && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Bairro</label>
                                <p className="text-foreground">{selectedEmpresa.dadosReceitaWS.bairro}</p>
                              </div>
                            )}
                            {selectedEmpresa.dadosReceitaWS.municipio && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Município</label>
                                <p className="text-foreground">{selectedEmpresa.dadosReceitaWS.municipio}</p>
                              </div>
                            )}
                            {selectedEmpresa.dadosReceitaWS.cep && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">CEP</label>
                                <p className="text-foreground font-mono">{selectedEmpresa.dadosReceitaWS.cep}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Contatos */}
                      {(selectedEmpresa.dadosReceitaWS.email || selectedEmpresa.dadosReceitaWS.telefone) && (
                        <Card className="border-border">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Contatos</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              {selectedEmpresa.dadosReceitaWS.email && (
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                                  <p className="text-foreground">{selectedEmpresa.dadosReceitaWS.email}</p>
                                </div>
                              )}
                              {selectedEmpresa.dadosReceitaWS.telefone && (
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                                  <p className="text-foreground">{selectedEmpresa.dadosReceitaWS.telefone}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Atividades */}
                      {(selectedEmpresa.dadosReceitaWS.atividade_principal || selectedEmpresa.dadosReceitaWS.atividades_secundarias) && (
                        <Card className="border-border">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Atividades Econômicas</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {selectedEmpresa.dadosReceitaWS.atividade_principal && selectedEmpresa.dadosReceitaWS.atividade_principal.length > 0 && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Atividade Principal</label>
                                {selectedEmpresa.dadosReceitaWS.atividade_principal.map((ativ, idx) => (
                                  <div key={idx} className="mt-2">
                                    <Badge variant="default" className="mr-2">{ativ.code}</Badge>
                                    <span className="text-sm text-foreground">{ativ.text}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {selectedEmpresa.dadosReceitaWS.atividades_secundarias && selectedEmpresa.dadosReceitaWS.atividades_secundarias.length > 0 && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Atividades Secundárias</label>
                                <div className="space-y-2 mt-2">
                                  {selectedEmpresa.dadosReceitaWS.atividades_secundarias.map((ativ, idx) => (
                                    <div key={idx}>
                                      <Badge variant="secondary" className="mr-2">{ativ.code}</Badge>
                                      <span className="text-sm text-foreground">{ativ.text}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}


                      {/* Simples/Simei */}
                      {(selectedEmpresa.dadosReceitaWS.simples || selectedEmpresa.dadosReceitaWS.simei) && (
                        <Card className="border-border">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Regime Tributário</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {selectedEmpresa.dadosReceitaWS.simples && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Simples Nacional</label>
                                <div className="mt-2">
                                  <Badge variant={selectedEmpresa.dadosReceitaWS.simples.optante ? 'default' : 'secondary'}>
                                    {selectedEmpresa.dadosReceitaWS.simples.optante ? 'Optante' : 'Não Optante'}
                                  </Badge>
                                  {selectedEmpresa.dadosReceitaWS.simples.data_opcao && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Data de Opção: {selectedEmpresa.dadosReceitaWS.simples.data_opcao}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                            {selectedEmpresa.dadosReceitaWS.simei && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Simei</label>
                                <div className="mt-2">
                                  <Badge variant={selectedEmpresa.dadosReceitaWS.simei.optante ? 'default' : 'secondary'}>
                                    {selectedEmpresa.dadosReceitaWS.simei.optante ? 'Optante' : 'Não Optante'}
                                  </Badge>
                                  {selectedEmpresa.dadosReceitaWS.simei.data_opcao && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Data de Opção: {selectedEmpresa.dadosReceitaWS.simei.data_opcao}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
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
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Clientes;
