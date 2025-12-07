import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, UserCircle, FileText, Info, Copy, Check, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export interface ClienteEmpresa {
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
  socios?: Socio[];
  contratos?: Contrato[];
  dataConversao: string;
}

interface ClienteDetailSheetProps {
  empresa: ClienteEmpresa | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ClienteDetailSheet = ({ empresa, isOpen, onOpenChange }: ClienteDetailSheetProps) => {
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const { toast } = useToast();

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
      'cancelado': 'destructive'
    };
    return variants[status] || 'default';
  };

  if (!empresa) return null;

  const socios = empresa.socios || [];
  const contratos = empresa.contratos || [];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {empresa.razaoSocial}
          </SheetTitle>
          <SheetDescription>
            CNPJ: {empresa.cnpj} | Convertido em: {formatDate(empresa.dataConversao)}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="geral" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="socios">Sócios</TabsTrigger>
            <TabsTrigger value="receita">Receita Federal</TabsTrigger>
            <TabsTrigger value="contratos">Contratos ({contratos.length})</TabsTrigger>
            <TabsTrigger value="extras">Informações Extras</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-4">
            {empresa.informacoesExtras?.adicionadoPor && (
              <Card className="bg-muted/50 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <UserCircle className="h-4 w-4" />
                    Adicionado por
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-foreground font-medium">
                    {empresa.informacoesExtras.adicionadoPor.funcionarioNome}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {empresa.informacoesExtras.adicionadoPor.funcionarioCargo}
                  </p>
                </CardContent>
              </Card>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Razão Social</label>
                <p className="text-foreground">{empresa.razaoSocial}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome Fantasia</label>
                <p className="text-foreground">{empresa.nomeFantasia || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">CNPJ</label>
                <p className="text-foreground font-mono">{empresa.cnpj}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">UF</label>
                <p className="text-foreground">{empresa.uf}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Valor Total da Dívida</label>
                <p className="text-foreground font-semibold">{formatCurrency(empresa.valorTotalDivida)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Valor Selecionado</label>
                <p className="text-foreground font-semibold text-primary">{formatCurrency(empresa.valorDividaSelecionada)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Natureza da Dívida</label>
                <div className="text-foreground">
                  <Badge variant="outline">{empresa.naturezaDivida}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status na Receita</label>
                <p className="text-foreground">{empresa.statusReceita}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Estágio de Negociação</label>
                <div className="text-foreground">
                  <Badge variant={getStatusBadge(empresa.estagioNegociacao)}>
                    {empresa.estagioNegociacao}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="socios" className="space-y-4">
            {empresa.dadosReceitaWS?.qsa && empresa.dadosReceitaWS.qsa.length > 0 ? (
              <div className="space-y-4">
                {empresa.dadosReceitaWS.telefone && (
                  <Card className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Contatos dos Sócios</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-foreground">{empresa.dadosReceitaWS.telefone}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyPhone(empresa.dadosReceitaWS!.telefone!)}
                          >
                            {copiedPhone === empresa.dadosReceitaWS.telefone ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenWhatsApp(empresa.dadosReceitaWS!.telefone!)}
                          >
                            <MessageCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        </div>
                      </div>
                      {empresa.dadosReceitaWS.email && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">E-mail</label>
                          <p className="text-foreground">{empresa.dadosReceitaWS.email}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Quadro Societário (QSA)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {empresa.dadosReceitaWS.qsa.map((socio, index) => (
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
            {!empresa.dadosReceitaWS ? (
              <div className="text-center py-8 text-muted-foreground">
                <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Dados da Receita Federal não disponíveis</p>
                <p className="text-xs mt-2">Esta empresa foi adicionada antes da implementação da consulta automática</p>
              </div>
            ) : (
              <div className="space-y-6">
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Dados Cadastrais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      {empresa.dadosReceitaWS.tipo && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                          <p className="text-foreground">{empresa.dadosReceitaWS.tipo}</p>
                        </div>
                      )}
                      {empresa.dadosReceitaWS.porte && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Porte</label>
                          <p className="text-foreground">{empresa.dadosReceitaWS.porte}</p>
                        </div>
                      )}
                      {empresa.dadosReceitaWS.abertura && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Data de Abertura</label>
                          <p className="text-foreground">{empresa.dadosReceitaWS.abertura}</p>
                        </div>
                      )}
                      {empresa.dadosReceitaWS.natureza_juridica && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Natureza Jurídica</label>
                          <p className="text-foreground text-sm">{empresa.dadosReceitaWS.natureza_juridica}</p>
                        </div>
                      )}
                      {empresa.dadosReceitaWS.capital_social && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Capital Social</label>
                          <p className="text-foreground">{empresa.dadosReceitaWS.capital_social}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Situação Cadastral</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      {empresa.dadosReceitaWS.situacao && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Situação</label>
                          <Badge variant={empresa.dadosReceitaWS.situacao === 'ATIVA' ? 'default' : 'destructive'}>
                            {empresa.dadosReceitaWS.situacao}
                          </Badge>
                        </div>
                      )}
                      {empresa.dadosReceitaWS.data_situacao && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Data da Situação</label>
                          <p className="text-foreground">{empresa.dadosReceitaWS.data_situacao}</p>
                        </div>
                      )}
                      {empresa.dadosReceitaWS.motivo_situacao && (
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-muted-foreground">Motivo</label>
                          <p className="text-foreground">{empresa.dadosReceitaWS.motivo_situacao}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Endereço</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      {empresa.dadosReceitaWS.logradouro && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Logradouro</label>
                          <p className="text-foreground">{empresa.dadosReceitaWS.logradouro}</p>
                        </div>
                      )}
                      {empresa.dadosReceitaWS.numero && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Número</label>
                          <p className="text-foreground">{empresa.dadosReceitaWS.numero}</p>
                        </div>
                      )}
                      {empresa.dadosReceitaWS.complemento && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Complemento</label>
                          <p className="text-foreground">{empresa.dadosReceitaWS.complemento}</p>
                        </div>
                      )}
                      {empresa.dadosReceitaWS.bairro && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Bairro</label>
                          <p className="text-foreground">{empresa.dadosReceitaWS.bairro}</p>
                        </div>
                      )}
                      {empresa.dadosReceitaWS.municipio && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Município</label>
                          <p className="text-foreground">{empresa.dadosReceitaWS.municipio}</p>
                        </div>
                      )}
                      {empresa.dadosReceitaWS.cep && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">CEP</label>
                          <p className="text-foreground font-mono">{empresa.dadosReceitaWS.cep}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {(empresa.dadosReceitaWS.email || empresa.dadosReceitaWS.telefone) && (
                  <Card className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Contatos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        {empresa.dadosReceitaWS.email && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <p className="text-foreground">{empresa.dadosReceitaWS.email}</p>
                          </div>
                        )}
                        {empresa.dadosReceitaWS.telefone && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                            <p className="text-foreground">{empresa.dadosReceitaWS.telefone}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(empresa.dadosReceitaWS.atividade_principal || empresa.dadosReceitaWS.atividades_secundarias) && (
                  <Card className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Atividades Econômicas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {empresa.dadosReceitaWS.atividade_principal && empresa.dadosReceitaWS.atividade_principal.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Atividade Principal</label>
                          {empresa.dadosReceitaWS.atividade_principal.map((ativ, idx) => (
                            <div key={idx} className="mt-2">
                              <Badge variant="default" className="mr-2">{ativ.code}</Badge>
                              <span className="text-sm text-foreground">{ativ.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {empresa.dadosReceitaWS.atividades_secundarias && empresa.dadosReceitaWS.atividades_secundarias.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Atividades Secundárias</label>
                          <div className="space-y-2 mt-2">
                            {empresa.dadosReceitaWS.atividades_secundarias.map((ativ, idx) => (
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

                {(empresa.dadosReceitaWS.simples || empresa.dadosReceitaWS.simei) && (
                  <Card className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Regime Tributário</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {empresa.dadosReceitaWS.simples && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Simples Nacional</label>
                          <div className="mt-2">
                            <Badge variant={empresa.dadosReceitaWS.simples.optante ? 'default' : 'secondary'}>
                              {empresa.dadosReceitaWS.simples.optante ? 'Optante' : 'Não Optante'}
                            </Badge>
                            {empresa.dadosReceitaWS.simples.data_opcao && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Data de Opção: {empresa.dadosReceitaWS.simples.data_opcao}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {empresa.dadosReceitaWS.simei && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Simei</label>
                          <div className="mt-2">
                            <Badge variant={empresa.dadosReceitaWS.simei.optante ? 'default' : 'secondary'}>
                              {empresa.dadosReceitaWS.simei.optante ? 'Optante' : 'Não Optante'}
                            </Badge>
                            {empresa.dadosReceitaWS.simei.data_opcao && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Data de Opção: {empresa.dadosReceitaWS.simei.data_opcao}
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
            {contratos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum contrato cadastrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contratos.map((contrato) => (
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
            {Object.keys(empresa.informacoesExtras).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma informação extra cadastrada</p>
              </div>
            ) : (
              <div className="space-y-2">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(empresa.informacoesExtras, null, 2)}
                </pre>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default ClienteDetailSheet;
