import { useEffect, useState } from "react";
import { categoryService, productService } from "@/services/api";
import type { Category, Product, ProductForm } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  sku: "",
  categoryId: 0,
};

const centsToFloat = (cents: number) => cents / 100;

const formatCents = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

const parseCents = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits === "" ? 0 : parseInt(digits, 10);
};

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal de criação/edição
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [priceCents, setPriceCents] = useState(0);
  const [saving, setSaving] = useState(false);

  // Modal de confirmação de exclusão
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
      ]);
      setProducts(prods.sort((a, b) => a.name.localeCompare(b.name)));
      setFiltered(prods);
      setCategories(cats);
    } catch {
      toast.error("Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)
      )
    );
  }, [search, products]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setPriceCents(0);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    const cents = Math.round(product.price * 100);
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      stock: product.stock,
      sku: product.sku,
      categoryId: product.categoryId,
    });
    setPriceCents(cents);
    setFormOpen(true);
  };

  const handleChange = (field: keyof ProductForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) { toast.error("Nome é obrigatório."); return false; }
    if (!form.sku.trim()) { toast.error("SKU é obrigatório."); return false; }
    if (priceCents <= 0) { toast.error("Preço deve ser maior que zero."); return false; }
    if (form.stock < 0) { toast.error("Estoque não pode ser negativo."); return false; }
    if (!form.categoryId) { toast.error("Selecione uma categoria."); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      const payload: ProductForm = {
        ...form,
        price: centsToFloat(priceCents),
        stock: Number(form.stock),
        categoryId: Number(form.categoryId),
      };
      if (editing) {
        await productService.update(editing.id, payload);
        toast.success("Produto atualizado com sucesso.");
      } else {
        await productService.create(payload);
        toast.success("Produto criado com sucesso.");
      }
      setFormOpen(false);
      load();
    } catch {
      toast.error("Erro ao salvar produto.");
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (product: Product) => {
    setDeleting(product);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      setDeleteLoading(true);
      await productService.delete(deleting.id);
      toast.success("Produto excluído com sucesso.");
      setDeleteOpen(false);
      setDeleting(null);
      load();
    } catch (error) {
      toast.error("Erro ao excluir produto.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <Card className="p-4 border-color-border-default cursor-default">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-color-text-primary" />
          <h1 className="text-2xl font-bold text-color-text-primary">Produtos</h1>
        </div>
        <Button
          onClick={openCreate}
          className="flex items-center gap-2 bg-color-primary hover:bg-color-primary-hover text-color-text-primary"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </Button>
      </div>

      {/* Busca */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-color-text-secondary" />
        <Input
          placeholder="Buscar por nome, SKU ou categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-color-surface border-color-border-default text-color-text-primary"
        />
      </div>

      {/* Tabela */}
      <Card className="border-color-border-default shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-color-text-primary text-base">
            {loading ? "Carregando..." : `${filtered.length} produtos`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-color-border-default">
                <TableHead className="text-color-text-primary">SKU</TableHead>
                <TableHead className="text-color-text-primary">Nome</TableHead>
                <TableHead className="text-color-text-primary">Categoria</TableHead>
                <TableHead className="text-color-text-primary text-right">Preço</TableHead>
                <TableHead className="text-color-text-primary text-right">Estoque</TableHead>
                <TableHead className="text-color-text-primary text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-color-text-secondary py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-color-text-secondary py-8">
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((product) => (
                  <TableRow key={product.id} className="border-color-border-default">
                    <TableCell className="text-color-text-primary font-mono text-sm">{product.sku}</TableCell>
                    <TableCell className="text-color-text-primary font-medium">{product.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-color-surface text-color-text-primary border border-color-border-default">
                        {product.category?.name ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-color-text-primary text-right">
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-medium ${product.stock <= 10
                          ? "text-red-500"
                          : product.stock <= 30
                            ? "text-yellow-500"
                            : "text-green-500"
                          }`}
                      >
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(product)}
                          className="text-color-text-secondary hover:text-color-text-primary hover:bg-color-surface"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDelete(product)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal: Criar / Editar */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-color-bg-secondary border-color-border-default max-w-lg text-color-text-primary">
          <DialogHeader>
            <DialogTitle className="text-color-text-primary">
              {editing ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 col-span-2">
                <Label className="text-color-text-primary">Nome *</Label>
                <Input
                  placeholder="Nome do produto"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="bg-color-surface border-color-border-default text-color-text-primary"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-color-text-primary">SKU *</Label>
                <Input
                  placeholder="Ex: PROD-001"
                  value={form.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                  className="bg-color-surface border-color-border-default text-color-text-primary"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-color-text-primary">Categoria *</Label>
                <select
                  value={form.categoryId}
                  onChange={(e) => handleChange("categoryId", Number(e.target.value))}
                  className="h-10 w-full rounded-md border border-color-border-default bg-color-surface px-3 text-sm text-color-text-primary focus:outline-none focus:ring-2 focus:ring-color-primary"
                >
                  <option value={0} disabled>Selecione...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-color-text-primary">Preço *</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  value={priceCents === 0 ? "" : formatCents(priceCents)}
                  onChange={(e) => setPriceCents(parseCents(e.target.value))}
                  className="bg-color-surface border-color-border-default text-color-text-primary"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-color-text-primary">Estoque *</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                  className="bg-color-surface border-color-border-default text-color-text-primary"
                />
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <Label className="text-color-text-primary">Descrição</Label>
                <Textarea
                  placeholder="Descrição opcional..."
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="bg-color-surface border-color-border-default text-color-text-primary resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setFormOpen(false)}
              className="text-color-text-secondary hover:text-color-text-primary"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-color-primary hover:bg-color-primary-hover dark:text-color-text-primary text-color-text-inverse"
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmar exclusão */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-color-bg-secondary border-color-border-default">
          <DialogHeader>
            <DialogTitle className="text-color-text-primary">Excluir Produto</DialogTitle>
          </DialogHeader>
          <p className="text-color-text-secondary">
            Tem certeza que deseja excluir o produto{" "}
            <span className="font-semibold text-color-text-primary">"{deleting?.name}"</span>? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteOpen(false)}
              className="text-color-text-secondary hover:text-color-text-primary"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteLoading ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
