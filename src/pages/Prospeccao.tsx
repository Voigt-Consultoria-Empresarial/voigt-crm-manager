import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Download, MoreVertical, Trash2, Eye, UserPlus, RefreshCw, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const Prospeccao = () => {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState("25");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingDebtor, setViewingDebtor] = useState<Debtor | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    const savedDebtors = localStorage.getItem("prospeccao_debtors");
    const savedMetadata = localStorage.getItem("prospeccao_metadata");
    
    if (savedDebtors) {
      setDebtors(JSON.parse(savedDebtors));
    }
    if (savedMetadata) {
      setMetadata(JSON.parse(savedMetadata));
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

  const convertDebtorToEmpresa = (debtor: Debtor) => {
    // Parse valores removendo formatação
    const parseValue = (value: string): number => {
      return parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
    };

    const empresa = {
      id: debtor.id,
      razaoSocial: debtor.nome,
      nomeFantasia: debtor.nomeFantasia || debtor.nome,
      cnpj: debtor.cpfCnpj,
      uf: metadata?.estado || '',
      valorTotalDivida: parseValue(debtor.valorTotal),
      valorDividaSelecionada: parseValue(debtor.valorDividaSelecionada),
      naturezaDivida: metadata?.naturezaDivida || '',
      statusReceita: 'pendente',
      estagioNegociacao: 'prospeccao',
      informacoesExtras: {
        origem: 'importacao_pgfn',
        dataImportacao: new Date().toISOString(),
        metadados: metadata ? {
          faixaValorMinimo: metadata.faixaValorMinimo,
          faixaValorMaximo: metadata.faixaValorMaximo,
          dataPesquisa: metadata.dataPesquisa,
        } : {}
      },
      socios: [],
      contratos: [],
      dataConversao: new Date().toISOString()
    };

    return empresa;
  };

  const handleBulkAddToClients = () => {
    const selectedDebtors = debtors.filter(d => selectedRows.has(d.id));
    const empresasToAdd = selectedDebtors.map(convertDebtorToEmpresa);

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

    toast({
      title: "Adicionado aos clientes",
      description: `${newEmpresas.length} empresa(s) adicionada(s) aos clientes.`,
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

  const handleViewDebtor = (debtor: Debtor) => {
    setViewingDebtor(debtor);
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
                            <DropdownMenuItem onClick={() => {
                              const empresa = convertDebtorToEmpresa(debtor);
                              
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
                              
                              toast({
                                title: "Adicionado aos clientes",
                                description: "Empresa adicionada com sucesso.",
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

      {/* Dialog de Visualização */}
      <Dialog open={!!viewingDebtor} onOpenChange={(open) => !open && setViewingDebtor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Devedor</DialogTitle>
            <DialogDescription>
              Informações completas do registro
            </DialogDescription>
          </DialogHeader>
          {viewingDebtor && (
            <div className="space-y-4">
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
              
              {metadata && (
                <div className="border-t pt-4 mt-4">
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prospeccao;
