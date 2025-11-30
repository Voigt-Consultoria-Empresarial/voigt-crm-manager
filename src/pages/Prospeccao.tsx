import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Download, MoreVertical, Trash2, Eye, UserPlus, RefreshCw, Copy, Check, Phone, MessageCircle, Loader2, Building2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface Debtor {
  id: string;
  cpfCnpj: string;
  nome: string;
  nomeFantasia: string;
  valorTotal: string;
  valorDividaSelecionada: string;
}

interface Metadata {
  faixaValorMinimo: string;
  estado: string;
  faixaValorMaximo: string;
  naturezaDivida: string;
  dataPesquisa: string;
}

interface QSA {
  nome: string;
  qual: string;
  pais_origem?: string;
  nome_rep_legal?: string;
  qual_rep_legal?: string;
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

interface ReceitaWSData {
  status: string;
  message?: string;
  ultima_atualizacao?: string;
  cnpj: string;
  tipo: string;
  porte: string;
  nome: string;
  fantasia: string;
  abertura: string;
  atividade_principal?: AtividadeEconomica[];
  atividades_secundarias?: AtividadeEconomica[];
  natureza_juridica: string;
  logradouro: string;
  numero: string;
  complemento: string;
  cep: string;
  bairro: string;
  municipio: string;
  uf: string;
  email: string;
  telefone: string;
  efr?: string;
  situacao: string;
  data_situacao?: string;
  motivo_situacao?: string;
  situacao_especial?: string;
  data_situacao_especial?: string;
  capital_social: string;
  qsa: QSA[];
  simples?: Simples;
  simei?: Simples;
}

const Prospeccao = () => {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState("25");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingDebtor, setViewingDebtor] = useState<Debtor | null>(null);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [clienteCnpjs, setClienteCnpjs] = useState<Set<string>>(new Set());
  const [receitaData, setReceitaData] = useState<ReceitaWSData | null>(null);
  const [loadingReceita, setLoadingReceita] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const { toast } = useToast();
  const { funcionario } = useAuth();

  // Load data from localStorage on mount
  useEffect(() => {
    const savedDebtors = localStorage.getItem("prospeccao_debtors");
    const savedMetadata = localStorage.getItem("prospeccao_metadata");
    const savedEmpresas = localStorage.getItem('clientes_empresas');
    
    if (savedDebtors) {
      setDebtors(JSON.parse(savedDebtors));
    }
    if (savedMetadata) {
      setMetadata(JSON.parse(savedMetadata));
    }
    if (savedEmpresas) {
      const empresas = JSON.parse(savedEmpresas);
      setClienteCnpjs(new Set(empresas.map((e: any) => e.cnpj)));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (debtors.length > 0) {
      localStorage.setItem("prospeccao_debtors", JSON.stringify(debtors));
    }
  }, [debtors]);

  useEffect(() => {
    if (metadata) {
      localStorage.setItem("prospeccao_metadata", JSON.stringify(metadata));
    }
  }, [metadata]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file, "UTF-8");
  };

  const parseCSV = (text: string) => {
    const lines = text.split("\n");
    
    // Parse metadata
    const meta: Metadata = {
      faixaValorMinimo: "",
      estado: "",
      faixaValorMaximo: "",
      naturezaDivida: "",
      dataPesquisa: "",
    };

    let dataStartIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Extract value after colon, removing quotes and extra spaces
      const extractValue = (line: string): string => {
        const colonIndex = line.indexOf(":");
        if (colonIndex === -1) return "";
        return line.substring(colonIndex + 1).replace(/"/g, "").trim();
      };
      
      if (line.includes("Faixa de Valor Mínimo") || line.includes("Faixa de valor mínimo") || line.includes("Faixa de Valor M")) {
        meta.faixaValorMinimo = extractValue(line);
      } else if (line.includes("Faixa de Valor Máximo") || line.includes("Faixa de valor máximo") || line.includes("Faixa de Valor M")) {
        if (!meta.faixaValorMinimo || line.toLowerCase().includes("máximo") || line.includes("M�ximo")) {
          meta.faixaValorMaximo = extractValue(line);
        }
      } else if (line.includes("Estado:")) {
        meta.estado = extractValue(line);
      } else if (line.includes("Natureza da d") || line.includes("Natureza da divida")) {
        meta.naturezaDivida = extractValue(line);
      } else if (line.includes("Data da pesquisa")) {
        meta.dataPesquisa = extractValue(line);
      } else if (line.includes("CPF/CNPJ")) {
        dataStartIndex = i + 1;
        break;
      }
    }

    setMetadata(meta);

    // Parse debtors
    const parsedDebtors: Debtor[] = [];
    for (let i = dataStartIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(";").map(v => v.replace(/"/g, "").trim());
      if (values.length >= 5) {
        parsedDebtors.push({
          id: `${i}-${Date.now()}`,
          cpfCnpj: values[0],
          nome: values[1],
          nomeFantasia: values[2],
          valorTotal: values[3],
          valorDividaSelecionada: values[4],
        });
      }
    }

    setDebtors(parsedDebtors);
    toast({
      title: "Importação concluída",
      description: `${parsedDebtors.length} registros importados com sucesso.`,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedDebtors.map(d => d.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  const handleBulkDelete = () => {
    setDebtors(debtors.filter(d => !selectedRows.has(d.id)));
    setSelectedRows(new Set());
    toast({
      title: "Registros removidos",
      description: `${selectedRows.size} registro(s) removido(s) com sucesso.`,
    });
  };

  const convertDebtorToEmpresa = async (debtor: Debtor, dadosApi?: ReceitaWSData) => {
    // Parse valores removendo formatação
    const parseValue = (value: string): number => {
      return parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
    };

    // Se não tiver dados da API, buscar
    let receitaData = dadosApi;
    if (!receitaData) {
      try {
        const cnpjLimpo = debtor.cpfCnpj.replace(/[^\d]/g, '');
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://receitaws.com.br/v1/cnpj/${cnpjLimpo}`)}`;
        const response = await fetch(proxyUrl);
        if (response.ok) {
          receitaData = await response.json();
        }
      } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
      }
    }

    const empresa = {
      id: debtor.id,
      razaoSocial: receitaData?.nome || debtor.nome,
      nomeFantasia: receitaData?.fantasia || debtor.nomeFantasia || debtor.nome,
      cnpj: debtor.cpfCnpj,
      uf: receitaData?.uf || metadata?.estado || '',
      valorTotalDivida: parseValue(debtor.valorTotal),
      valorDividaSelecionada: parseValue(debtor.valorDividaSelecionada),
      naturezaDivida: metadata?.naturezaDivida || '',
      statusReceita: receitaData?.situacao || 'pendente',
      estagioNegociacao: 'prospeccao',
      funcionarioId: funcionario?.id || '',
      funcionarioNome: funcionario?.nome || '',
      informacoesExtras: {
        origem: 'importacao_pgfn',
        dataImportacao: new Date().toISOString(),
        adicionadoPor: {
          funcionarioId: funcionario?.id || '',
          funcionarioNome: funcionario?.nome || '',
          funcionarioCargo: funcionario?.cargo || ''
        },
        metadados: metadata ? {
          faixaValorMinimo: metadata.faixaValorMinimo,
          faixaValorMaximo: metadata.faixaValorMaximo,
          dataPesquisa: metadata.dataPesquisa,
        } : {}
      },
      dadosReceitaWS: receitaData ? {
        ultima_atualizacao: receitaData.ultima_atualizacao,
        tipo: receitaData.tipo,
        porte: receitaData.porte,
        abertura: receitaData.abertura,
        atividade_principal: receitaData.atividade_principal,
        atividades_secundarias: receitaData.atividades_secundarias,
        natureza_juridica: receitaData.natureza_juridica,
        logradouro: receitaData.logradouro,
        numero: receitaData.numero,
        complemento: receitaData.complemento,
        cep: receitaData.cep,
        bairro: receitaData.bairro,
        municipio: receitaData.municipio,
        email: receitaData.email,
        telefone: receitaData.telefone,
        efr: receitaData.efr,
        situacao: receitaData.situacao,
        data_situacao: receitaData.data_situacao,
        motivo_situacao: receitaData.motivo_situacao,
        situacao_especial: receitaData.situacao_especial,
        data_situacao_especial: receitaData.data_situacao_especial,
        capital_social: receitaData.capital_social,
        qsa: receitaData.qsa,
        simples: receitaData.simples,
        simei: receitaData.simei,
      } : undefined,
      socios: [],
      contratos: [],
      dataConversao: new Date().toISOString()
    };

    return empresa;
  };

  const handleBulkAddToClients = async () => {
    const selectedDebtors = debtors.filter(d => selectedRows.has(d.id));
    
    toast({
      title: "Processando...",
      description: `Consultando dados de ${selectedDebtors.length} empresa(s) na Receita Federal...`,
    });

    const empresasToAdd = await Promise.all(
      selectedDebtors.map(debtor => convertDebtorToEmpresa(debtor))
    );

    // Carregar empresas existentes
    const savedEmpresas = localStorage.getItem('clientes_empresas');
    const existingEmpresas = savedEmpresas ? JSON.parse(savedEmpresas) : [];

    // Filtrar duplicados por CNPJ
    const existingCnpjs = new Set(existingEmpresas.map((e: any) => e.cnpj));
    const newEmpresas = empresasToAdd.filter(e => !existingCnpjs.has(e.cnpj));

    if (newEmpresas.length === 0) {
      toast({
        title: "Nenhum novo cliente",
        description: "Todas as empresas selecionadas já estão cadastradas.",
        variant: "destructive"
      });
      return;
    }

    // Adicionar novas empresas
    const updatedEmpresas = [...existingEmpresas, ...newEmpresas];
    localStorage.setItem('clientes_empresas', JSON.stringify(updatedEmpresas));

    // Atualizar lista de CNPJs de clientes
    setClienteCnpjs(new Set(updatedEmpresas.map((e: any) => e.cnpj)));

    toast({
      title: "Adicionado aos clientes",
      description: `${newEmpresas.length} empresa(s) adicionada(s) aos clientes com dados completos da Receita Federal.`,
    });
    
    setSelectedRows(new Set());
  };

  const handleRefresh = () => {
    setDebtors([]);
    setMetadata(null);
    setSelectedRows(new Set());
    setCurrentPage(1);
    localStorage.removeItem("prospeccao_debtors");
    localStorage.removeItem("prospeccao_metadata");
    toast({
      title: "Dados removidos",
      description: "A planilha importada foi removida com sucesso.",
    });
  };

  const handleCopyCpfCnpj = (cpfCnpj: string, id: string) => {
    navigator.clipboard.writeText(cpfCnpj);
    setCopiedId(id);
    toast({
      title: "Copiado!",
      description: "CPF/CNPJ copiado para a área de transferência.",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleViewDebtor = async (debtor: Debtor) => {
    setViewingDebtor(debtor);
    setIsViewSheetOpen(true);
    setReceitaData(null);
    setLoadingReceita(true);
    
    try {
      // Remover caracteres especiais do CNPJ
      const cnpjLimpo = debtor.cpfCnpj.replace(/[^\d]/g, '');
      
      // Usando proxy CORS para contornar bloqueio do navegador
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://receitaws.com.br/v1/cnpj/${cnpjLimpo}`)}`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'ERROR') {
        throw new Error(data.message || 'Erro ao buscar dados');
      }
      
      setReceitaData(data);
      toast({
        title: "Dados obtidos com sucesso",
        description: "Informações da Receita Federal carregadas.",
      });
    } catch (error) {
      console.error('Erro ao buscar dados da ReceitaWS:', error);
      
      toast({
        title: "Erro ao consultar Receita Federal",
        description: "Não foi possível consultar os dados. Tente novamente mais tarde.",
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setLoadingReceita(false);
    }
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

  const totalPages = Math.ceil(debtors.length / parseInt(pageSize));
  const startIndex = (currentPage - 1) * parseInt(pageSize);
  const paginatedDebtors = debtors.slice(startIndex, startIndex + parseInt(pageSize));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Prospecção</h1>
        <p className="text-muted-foreground mt-1">
          Importe e gerencie listas de devedores PGFN
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Importar Lista</CardTitle>
          <CardDescription>
            Faça upload da planilha de devedores no formato CSV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="max-w-md"
            />
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Template
            </Button>
            {debtors.length > 0 && (
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Limpar Dados
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {metadata && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Metadados da Importação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <p className="text-sm font-semibold text-foreground mt-1">{metadata.estado}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Mínimo</p>
                <p className="text-sm font-semibold text-foreground mt-1">{metadata.faixaValorMinimo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Máximo</p>
                <p className="text-sm font-semibold text-foreground mt-1">{metadata.faixaValorMaximo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Natureza</p>
                <p className="text-sm font-semibold text-foreground mt-1">{metadata.naturezaDivida}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data da Pesquisa</p>
                <p className="text-sm font-semibold text-foreground mt-1">{metadata.dataPesquisa}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {debtors.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Devedores</CardTitle>
                <CardDescription className="mt-1">
                  {debtors.length} registro(s) importado(s)
                </CardDescription>
              </div>
              {selectedRows.size > 0 && (
                <div className="flex gap-2">
                  <Badge variant="secondary">{selectedRows.size} selecionado(s)</Badge>
                  <Button size="sm" variant="outline" onClick={handleBulkAddToClients}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Adicionar aos Clientes
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                     <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRows.size === paginatedDebtors.length && paginatedDebtors.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-[180px]">CPF/CNPJ</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Nome Fantasia</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-right">Valor Dívida</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDebtors.map((debtor) => (
                    <TableRow key={debtor.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(debtor.id)}
                          onCheckedChange={(checked) => handleSelectRow(debtor.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="w-[180px]">
                        <div className="space-y-1">
                          {clienteCnpjs.has(debtor.cpfCnpj) && (
                            <Badge className="bg-yellow-400 text-black hover:bg-yellow-500 text-xs px-2 py-0">
                              Cliente
                            </Badge>
                          )}
                          <div
                            onClick={() => handleCopyCpfCnpj(debtor.cpfCnpj, debtor.id)}
                            className="font-mono text-sm whitespace-nowrap hover:text-primary transition-colors flex items-center gap-2 cursor-pointer group"
                            title="Clique para copiar"
                          >
                            {debtor.cpfCnpj}
                            {copiedId === debtor.id ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{debtor.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{debtor.nomeFantasia || "-"}</TableCell>
                      <TableCell className="text-right font-medium">{debtor.valorTotal}</TableCell>
                      <TableCell className="text-right font-medium text-accent">{debtor.valorDividaSelecionada}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDebtor(debtor)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={async () => {
                              toast({
                                title: "Processando...",
                                description: "Consultando dados na Receita Federal...",
                              });

                              const empresa = await convertDebtorToEmpresa(debtor, receitaData || undefined);
                              
                              // Carregar empresas existentes
                              const savedEmpresas = localStorage.getItem('clientes_empresas');
                              const existingEmpresas = savedEmpresas ? JSON.parse(savedEmpresas) : [];
                              
                              // Verificar duplicado
                              const exists = existingEmpresas.some((e: any) => e.cnpj === empresa.cnpj);
                              if (exists) {
                                toast({
                                  title: "Cliente já existe",
                                  description: "Esta empresa já está cadastrada nos clientes.",
                                  variant: "destructive"
                                });
                                return;
                              }
                              
                              // Adicionar nova empresa
                              const updatedEmpresas = [...existingEmpresas, empresa];
                              localStorage.setItem('clientes_empresas', JSON.stringify(updatedEmpresas));

                              // Atualizar lista de CNPJs de clientes
                              setClienteCnpjs(new Set(updatedEmpresas.map((e: any) => e.cnpj)));
                              
                              toast({
                                title: "Adicionado aos clientes",
                                description: "Empresa adicionada com sucesso com dados completos da Receita Federal.",
                              });
                            }}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Adicionar aos Clientes
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                setDebtors(debtors.filter(d => d.id !== debtor.id));
                                toast({
                                  title: "Registro removido",
                                  description: "O registro foi removido com sucesso.",
                                });
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Exibir</span>
                <Select value={pageSize} onValueChange={setPageSize}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="75">75</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">registros por página</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sheet de Visualização */}
      <Sheet open={isViewSheetOpen} onOpenChange={(open) => {
        setIsViewSheetOpen(open);
        if (!open) {
          setViewingDebtor(null);
          setReceitaData(null);
        }
      }}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center justify-between mb-2">
              <div>
                <SheetTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Detalhes da Empresa
                </SheetTitle>
                <SheetDescription>
                  Informações completas do registro e quadro societário
                </SheetDescription>
              </div>
              {viewingDebtor && (
                <Button
                  onClick={async () => {
                    if (!viewingDebtor) return;
                    
                    // Verificar se já é cliente
                    if (clienteCnpjs.has(viewingDebtor.cpfCnpj)) {
                      toast({
                        title: "Já é cliente",
                        description: "Esta empresa já está cadastrada como cliente.",
                        variant: "destructive"
                      });
                      return;
                    }

                    toast({
                      title: "Processando...",
                      description: "Consultando dados na Receita Federal...",
                    });

                    const empresa = await convertDebtorToEmpresa(viewingDebtor, receitaData || undefined);
                    
                    const savedEmpresas = localStorage.getItem('clientes_empresas');
                    const existingEmpresas = savedEmpresas ? JSON.parse(savedEmpresas) : [];
                    const updatedEmpresas = [...existingEmpresas, empresa];
                    localStorage.setItem('clientes_empresas', JSON.stringify(updatedEmpresas));
                    
                    setClienteCnpjs(new Set(updatedEmpresas.map((e: any) => e.cnpj)));
                    
                    toast({
                      title: "Adicionado aos clientes",
                      description: "Empresa adicionada com sucesso aos clientes.",
                    });
                    
                    setIsViewSheetOpen(false);
                  }}
                  className="gap-2"
                  disabled={clienteCnpjs.has(viewingDebtor?.cpfCnpj || '')}
                >
                  <UserPlus className="h-4 w-4" />
                  {clienteCnpjs.has(viewingDebtor?.cpfCnpj || '') ? 'Já é Cliente' : 'Adicionar Cliente'}
                </Button>
              )}
            </div>
          </SheetHeader>
          {viewingDebtor && (
            <div className="space-y-6">
              {/* Dados Básicos */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CPF/CNPJ</p>
                    <p className="text-sm font-semibold text-foreground mt-1 font-mono">{viewingDebtor.cpfCnpj}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome/Razão Social</p>
                    <p className="text-sm font-semibold text-foreground mt-1">{viewingDebtor.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome Fantasia</p>
                    <p className="text-sm font-semibold text-foreground mt-1">{viewingDebtor.nomeFantasia || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                    <p className="text-sm font-semibold text-foreground mt-1">{viewingDebtor.valorTotal}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor Dívida Selecionada</p>
                    <p className="text-sm font-semibold text-accent mt-1">{viewingDebtor.valorDividaSelecionada}</p>
                  </div>
                </div>
              </div>

              {/* Dados da Receita Federal */}
              {loadingReceita && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Consultando Receita Federal...</span>
                </div>
              )}

              {receitaData && (
                <>
                  {/* Informações Cadastrais */}
                  <div className="border-t pt-4 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Dados Cadastrais (Receita Federal)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Situação</p>
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">{receitaData.situacao}</p>
                          {receitaData.data_situacao && (
                            <p className="text-xs text-muted-foreground">
                              Desde {receitaData.data_situacao}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Data de Abertura</p>
                        <p className="text-sm font-medium">{receitaData.abertura}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tipo</p>
                        <p className="text-sm font-medium">{receitaData.tipo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Porte</p>
                        <p className="text-sm font-medium">{receitaData.porte}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Natureza Jurídica</p>
                        <p className="text-sm font-medium">{receitaData.natureza_juridica}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Capital Social</p>
                        <p className="text-sm font-medium">{receitaData.capital_social}</p>
                      </div>
                      {receitaData.simples && (
                        <div>
                          <p className="text-xs text-muted-foreground">Simples Nacional</p>
                          <p className="text-sm font-medium">
                            {receitaData.simples.optante ? "Sim" : "Não"}
                          </p>
                        </div>
                      )}
                      {receitaData.simei && (
                        <div>
                          <p className="text-xs text-muted-foreground">SIMEI</p>
                          <p className="text-sm font-medium">
                            {receitaData.simei.optante ? "Sim" : "Não"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Atividades Econômicas */}
                  {receitaData.atividade_principal && receitaData.atividade_principal.length > 0 && (
                    <div className="border-t pt-4 space-y-4">
                      <h3 className="text-sm font-semibold text-foreground">Atividades Econômicas</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Atividade Principal</p>
                          {receitaData.atividade_principal.map((ativ, idx) => (
                            <p key={idx} className="text-sm font-medium">
                              {ativ.code} - {ativ.text}
                            </p>
                          ))}
                        </div>
                        {receitaData.atividades_secundarias && receitaData.atividades_secundarias.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Atividades Secundárias</p>
                            <div className="space-y-1">
                              {receitaData.atividades_secundarias.map((ativ, idx) => (
                                <p key={idx} className="text-sm">
                                  {ativ.code} - {ativ.text}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Endereço */}
                  <div className="border-t pt-4 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Endereço</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">Logradouro</p>
                        <p className="text-sm font-medium">
                          {receitaData.logradouro}, {receitaData.numero}
                          {receitaData.complemento && ` - ${receitaData.complemento}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Bairro</p>
                        <p className="text-sm font-medium">{receitaData.bairro}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">CEP</p>
                        <p className="text-sm font-medium">{receitaData.cep}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Município</p>
                        <p className="text-sm font-medium">{receitaData.municipio}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">UF</p>
                        <p className="text-sm font-medium">{receitaData.uf}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contato */}
                  <div className="border-t pt-4 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Contato</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">E-mail</p>
                        <p className="text-sm font-medium">{receitaData.email || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Telefone</p>
                        {receitaData.telefone ? (
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium font-mono">{receitaData.telefone}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleCopyPhone(receitaData.telefone)}
                              title="Copiar telefone"
                            >
                              {copiedPhone === receitaData.telefone ? (
                                <Check className="h-3.5 w-3.5 text-green-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleOpenWhatsApp(receitaData.telefone)}
                              title="Abrir WhatsApp"
                            >
                              <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm font-medium">-</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quadro Societário */}
                  {receitaData.qsa && receitaData.qsa.length > 0 && (
                    <div className="border-t pt-4 space-y-4">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Quadro Societário ({receitaData.qsa.length} {receitaData.qsa.length === 1 ? 'sócio' : 'sócios'})
                      </h3>
                      
                      {/* Lista de Sócios */}
                      <div className="space-y-3">
                        {receitaData.qsa.map((socio, index) => (
                          <div key={index} className="border-l-2 border-primary/30 pl-4 py-2 space-y-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Nome</p>
                              <p className="text-sm font-semibold text-foreground">{socio.nome}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Qualificação</p>
                              <p className="text-sm font-medium">{socio.qual}</p>
                            </div>
                            {socio.pais_origem && (
                              <div>
                                <p className="text-xs text-muted-foreground">País de Origem</p>
                                <p className="text-sm font-medium">{socio.pais_origem}</p>
                              </div>
                            )}
                            {socio.nome_rep_legal && (
                              <div>
                                <p className="text-xs text-muted-foreground">Representante Legal</p>
                                <p className="text-sm font-medium">
                                  {socio.nome_rep_legal}
                                  {socio.qual_rep_legal && ` (${socio.qual_rep_legal})`}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Contatos dos Sócios - Agrupados */}
                      {receitaData.telefone && (
                        <Card className="border-border bg-muted/30">
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5" />
                                Contatos dos Sócios
                              </h4>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium font-mono">{receitaData.telefone}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleCopyPhone(receitaData.telefone)}
                                  title="Copiar telefone"
                                >
                                  {copiedPhone === receitaData.telefone ? (
                                    <Check className="h-3.5 w-3.5 text-green-600" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleOpenWhatsApp(receitaData.telefone)}
                                  title="Abrir WhatsApp"
                                >
                                  <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                                </Button>
                              </div>
                              {receitaData.email && (
                                <div>
                                  <p className="text-xs text-muted-foreground">E-mail</p>
                                  <p className="text-sm font-medium">{receitaData.email}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </>
              )}
              
              {/* Metadados */}
              {metadata && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Metadados da Importação</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Estado</p>
                      <p className="text-sm font-medium">{metadata.estado}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Natureza da Dívida</p>
                      <p className="text-sm font-medium">{metadata.naturezaDivida}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valor Mínimo</p>
                      <p className="text-sm font-medium">{metadata.faixaValorMinimo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valor Máximo</p>
                      <p className="text-sm font-medium">{metadata.faixaValorMaximo}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Prospeccao;
