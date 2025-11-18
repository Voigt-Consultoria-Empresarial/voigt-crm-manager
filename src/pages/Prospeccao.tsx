import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Download, MoreVertical, Trash2, Eye, UserPlus } from "lucide-react";
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
  const { toast } = useToast();

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
      if (line.includes("Faixa de Valor Mínimo")) {
        meta.faixaValorMinimo = line.split(":")[1]?.trim() || "";
      } else if (line.includes("Estado:")) {
        meta.estado = line.split(":")[1]?.trim() || "";
      } else if (line.includes("Faixa de Valor Máximo")) {
        meta.faixaValorMaximo = line.split(":")[1]?.trim() || "";
      } else if (line.includes("Natureza da dívida")) {
        meta.naturezaDivida = line.split(":")[1]?.trim() || "";
      } else if (line.includes("Data da pesquisa")) {
        meta.dataPesquisa = line.split(":")[1]?.trim() || "";
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

  const handleBulkAddToClients = () => {
    toast({
      title: "Adicionado aos clientes",
      description: `${selectedRows.size} registro(s) adicionado(s) aos clientes.`,
    });
    setSelectedRows(new Set());
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
                    <TableHead>CPF/CNPJ</TableHead>
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
                      <TableCell className="font-mono text-sm">{debtor.cpfCnpj}</TableCell>
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Adicionar ao Clientes
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
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
    </div>
  );
};

export default Prospeccao;
