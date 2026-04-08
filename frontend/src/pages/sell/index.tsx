import { useEffect, useState } from 'react'
import { customerService, productService, saleService } from '@/services/api'
import type { Customer, Product, Sale, SaleForm } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Eye,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Check,
} from 'lucide-react'
import { toast } from 'react-toastify'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))

const STATUS_LABEL: Record<Sale['status'], string> = {
  PENDING: 'Pendente',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
}

const STATUS_CLASS: Record<Sale['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

type SortKey = 'id' | 'customer' | 'user' | 'createdAt' | 'status' | 'total'
type SortDir = 'asc' | 'desc' | 'none'

interface CartItem {
  product: Product
  quantity: number
}

const EMPTY_FORM: SaleForm = {
  customerId: 0,
  items: [],
}

export function Sell() {
  const [sales, setSales] = useState<Sale[]>([])
  const [filtered, setFiltered] = useState<Sale[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('none')

  // Modal nova venda
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<SaleForm>(EMPTY_FORM)
  const [cart, setCart] = useState<CartItem[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [saving, setSaving] = useState(false)

  // Modal aprovar
  const [approveOpen, setApproveOpen] = useState(false)
  const [approving, setApproving] = useState<Sale | null>(null)
  const [approveLoading, setApproveLoading] = useState(false)

  // Modal detalhes
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  // Modal cancelar
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState<Sale | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const [salesData, customersData, productsData] = await Promise.all([
        saleService.getAll(),
        customerService.getAll(),
        productService.getAll(),
      ])
      setSales(
        salesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      )
      setFiltered(salesData)
      setCustomers(customersData.sort((a, b) => a.name.localeCompare(b.name)))
      setProducts(productsData.sort((a, b) => a.name.localeCompare(b.name)))
    } catch {
      toast.error('Erro ao carregar vendas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      sales.filter(
        (s) =>
          s.customer?.name.toLowerCase().includes(q) ||
          s.user?.name.toLowerCase().includes(q) ||
          String(s.id).includes(q),
      ),
    )
  }, [search, sales])

  const handleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
    } else if (sortDir === 'asc') {
      setSortDir('desc')
    } else if (sortDir === 'desc') {
      setSortDir('none')
      setSortKey(null)
    } else {
      setSortDir('asc')
      setSortKey(key)
    }
  }

  const sorted = (() => {
    if (sortDir === 'none' || !sortKey) return filtered
    return [...filtered].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'id':
          cmp = a.id - b.id
          break
        case 'customer':
          cmp = (a.customer?.name ?? '').localeCompare(b.customer?.name ?? '')
          break
        case 'user':
          cmp = (a.user?.name ?? '').localeCompare(b.user?.name ?? '')
          break
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'status':
          cmp = a.status.localeCompare(b.status)
          break
        case 'total':
          cmp = a.total - b.total
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  })()

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setCart([])
    setProductSearch('')
    setFormOpen(true)
  }

  const openDetail = (sale: Sale) => {
    setSelectedSale(sale)
    setDetailOpen(true)
  }

  const openCancel = (sale: Sale) => {
    setCancelling(sale)
    setCancelOpen(true)
  }

  const openApprove = (sale: Sale) => {
    setApproving(sale)
    setApproveOpen(true)
  }

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
    setProductSearch('')
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId))
    } else {
      setCart((prev) => prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)))
    }
  }

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId))
  }

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  const filteredProducts = products.filter(
    (p) =>
      (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())) &&
      !cart.find((i) => i.product.id === p.id),
  )

  const handleSave = async () => {
    if (!form.customerId) {
      toast.error('Selecione um cliente.')
      return
    }
    if (cart.length === 0) {
      toast.error('Adicione ao menos um produto.')
      return
    }
    try {
      setSaving(true)
      const payload: SaleForm = {
        customerId: Number(form.customerId),
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      }
      await saleService.create(payload)
      toast.success('Venda registrada com sucesso.')
      setFormOpen(false)
      load()
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } }
      toast.error(axiosError.response?.data?.error || 'Erro ao registrar venda.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    if (!cancelling) return
    try {
      setCancelLoading(true)
      await saleService.cancel(cancelling.id)
      toast.success('Venda cancelada com sucesso.')
      setCancelOpen(false)
      setCancelling(null)
      load()
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } }
      toast.error(axiosError.response?.data?.error || 'Erro ao cancelar venda.')
    } finally {
      setCancelLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!approving) return
    try {
      setApproveLoading(true)
      await saleService.updateStatus(approving.id, 'COMPLETED')
      toast.success('Venda aprovada com sucesso.')
      setApproveOpen(false)
      setApproving(null)
      load()
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } }
      toast.error(axiosError.response?.data?.error || 'Erro ao aprovar venda.')
    } finally {
      setApproveLoading(false)
    }
  }

  return (
    <Card className="p-4 border-color-border-default cursor-default">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-color-text-primary" />
          <h1 className="text-2xl font-bold text-color-text-primary">Vendas</h1>
        </div>
        <Button
          onClick={openCreate}
          className="flex items-center gap-2 bg-color-primary hover:bg-color-primary-hover text-color-text-primary"
        >
          <Plus className="w-4 h-4" />
          Nova Venda
        </Button>
      </div>

      {/* Busca */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-color-text-secondary" />
        <Input
          placeholder="Buscar por cliente, vendedor ou nº..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-color-surface border-color-border-default text-color-text-primary"
        />
      </div>

      {/* Tabela */}
      <Card className="border-color-border-default shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-color-text-primary text-base">
            {loading ? 'Carregando...' : `${filtered.length} vendas`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-color-border-default">
                {(
                  [
                    { key: 'id', label: 'Nº' },
                    { key: 'customer', label: 'Cliente' },
                    { key: 'user', label: 'Vendedor' },
                    { key: 'createdAt', label: 'Data' },
                    { key: 'status', label: 'Status' },
                    { key: 'total', label: 'Total', right: true },
                  ] as { key: SortKey; label: string; right?: boolean }[]
                ).map(({ key, label, right }) => (
                  <TableHead
                    key={key}
                    className={`text-color-text-primary select-none cursor-pointer hover:text-color-text-primary ${right ? 'text-right' : ''}`}
                    onClick={() => handleSort(key)}
                  >
                    <span
                      className={`inline-flex items-center gap-1 ${right ? 'justify-end w-full' : ''}`}
                    >
                      {label}
                      {sortKey === key && sortDir === 'asc' ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : sortKey === key && sortDir === 'desc' ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </span>
                  </TableHead>
                ))}
                <TableHead className="text-color-text-primary text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-color-text-secondary py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-color-text-secondary py-8">
                    Nenhuma venda encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((sale) => (
                  <TableRow key={sale.id} className="border-color-border-default">
                    <TableCell className="text-color-text-primary font-mono text-sm">
                      #{sale.id}
                    </TableCell>
                    <TableCell className="text-color-text-primary font-medium">
                      {sale.customer?.name ?? '—'}
                    </TableCell>
                    <TableCell className="text-color-text-secondary">
                      {sale.user?.name ?? '—'}
                    </TableCell>
                    <TableCell className="text-color-text-secondary">
                      {formatDate(sale.createdAt)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASS[sale.status]}`}
                      >
                        {STATUS_LABEL[sale.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-color-text-primary text-right font-medium">
                      {formatCurrency(sale.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          title="Visualizar Venda"
                          variant="ghost"
                          size="icon"
                          onClick={() => openDetail(sale)}
                          className="text-color-text-secondary hover:text-color-text-primary hover:bg-color-surface"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {sale.status === 'PENDING' && (
                          <>
                            <Button
                              title="Cancelar Venda"
                              variant="ghost"
                              size="icon"
                              onClick={() => openCancel(sale)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button
                              title="Aprovar Venda"
                              variant="ghost"
                              size="icon"
                              onClick={() => openApprove(sale)}
                              className="text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal: Nova Venda */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-color-bg-secondary border-color-border-default max-w-2xl text-color-text-primary">
          <DialogHeader>
            <DialogTitle className="text-color-text-primary">Nova Venda</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            {/* Cliente */}
            <div className="flex flex-col gap-2">
              <Label className="text-color-text-primary">Cliente *</Label>
              <select
                value={form.customerId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, customerId: Number(e.target.value) }))
                }
                className="h-10 w-full rounded-md border border-color-border-default bg-color-surface px-3 text-sm text-color-text-primary focus:outline-none focus:ring-2 focus:ring-color-primary"
              >
                <option value={0} disabled>
                  Selecione um cliente...
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Busca de produto */}
            <div className="flex flex-col gap-2">
              <Label className="text-color-text-primary">Adicionar Produto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-color-text-secondary" />
                <Input
                  placeholder="Buscar por nome ou SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-9 bg-color-surface border-color-border-default text-color-text-primary"
                />
              </div>
              {productSearch && filteredProducts.length > 0 && (
                <div className="border border-color-border-default rounded-md bg-color-surface max-h-40 overflow-y-auto">
                  {filteredProducts.slice(0, 8).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addToCart(p)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-color-bg-secondary text-color-text-primary border-b border-color-border-default last:border-0"
                    >
                      <span>
                        <span className="font-medium">{p.name}</span>
                        <span className="text-color-text-secondary ml-2 font-mono text-xs">
                          {p.sku}
                        </span>
                      </span>
                      <span className="text-color-text-secondary">{formatCurrency(p.price)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Carrinho */}
            {cart.length > 0 && (
              <div className="flex flex-col gap-2">
                <Label className="text-color-text-primary">Itens</Label>
                <div className="border border-color-border-default rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-color-border-default">
                        <TableHead className="text-color-text-primary">Produto</TableHead>
                        <TableHead className="text-color-text-primary text-center">Qtd</TableHead>
                        <TableHead className="text-color-text-primary text-right">
                          Subtotal
                        </TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.product.id} className="border-color-border-default">
                          <TableCell className="text-color-text-primary font-medium py-2">
                            {item.product.name}
                          </TableCell>
                          <TableCell className="text-center py-2">
                            <Input
                              type="number"
                              min={1}
                              max={item.product.stock}
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.product.id, Number(e.target.value))
                              }
                              className="w-16 text-center bg-color-surface border-color-border-default text-color-text-primary mx-auto"
                            />
                          </TableCell>
                          <TableCell className="text-right text-color-text-primary py-2">
                            {formatCurrency(item.product.price * item.quantity)}
                          </TableCell>
                          <TableCell className="py-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end text-color-text-primary font-semibold text-sm">
                  Total: {formatCurrency(cartTotal)}
                </div>
              </div>
            )}
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
              {saving ? 'Salvando...' : 'Registrar Venda'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Detalhes da Venda */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-color-bg-secondary border-color-border-default max-w-lg text-color-text-primary">
          <DialogHeader>
            <DialogTitle className="text-color-text-primary">Venda #{selectedSale?.id}</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-color-text-secondary">Cliente</p>
                  <p className="text-color-text-primary font-medium">
                    {selectedSale.customer?.name}
                  </p>
                </div>
                <div>
                  <p className="text-color-text-secondary">Vendedor</p>
                  <p className="text-color-text-primary font-medium">{selectedSale.user?.name}</p>
                </div>
                <div>
                  <p className="text-color-text-secondary">Data</p>
                  <p className="text-color-text-primary">{formatDate(selectedSale.createdAt)}</p>
                </div>
                <div>
                  <p className="text-color-text-secondary">Status</p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASS[selectedSale.status]}`}
                  >
                    {STATUS_LABEL[selectedSale.status]}
                  </span>
                </div>
              </div>
              <div className="border border-color-border-default rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-color-border-default">
                      <TableHead className="text-color-text-primary">Produto</TableHead>
                      <TableHead className="text-color-text-primary text-center">Qtd</TableHead>
                      <TableHead className="text-color-text-primary text-right">
                        Preço Unit.
                      </TableHead>
                      <TableHead className="text-color-text-primary text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.items?.map((item) => (
                      <TableRow key={item.id} className="border-color-border-default">
                        <TableCell className="text-color-text-primary py-2">
                          {item.product?.name}
                        </TableCell>
                        <TableCell className="text-center text-color-text-secondary py-2">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right text-color-text-secondary py-2">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right text-color-text-primary font-medium py-2">
                          {formatCurrency(item.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end text-color-text-primary font-semibold">
                Total: {formatCurrency(selectedSale.total)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDetailOpen(false)}
              className="text-color-text-secondary hover:text-color-text-primary"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Cancelar Venda */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="bg-color-bg-secondary border-color-border-default">
          <DialogHeader>
            <DialogTitle className="text-color-text-primary">Cancelar Venda</DialogTitle>
          </DialogHeader>
          <p className="text-color-text-secondary">
            Tem certeza que deseja cancelar a venda{' '}
            <span className="font-semibold text-color-text-primary">#{cancelling?.id}</span>? Esta
            ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setCancelOpen(false)}
              className="text-color-text-secondary hover:text-color-text-primary"
            >
              Voltar
            </Button>
            <Button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelLoading ? 'Cancelando...' : 'Cancelar Venda'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Aprovar Venda */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="bg-color-bg-secondary border-color-border-default">
          <DialogHeader>
            <DialogTitle className="text-color-text-primary">Aprovar Venda</DialogTitle>
          </DialogHeader>
          <p className="text-color-text-secondary">
            Tem certeza que deseja aprovar a venda{' '}
            <span className="font-semibold text-color-text-primary">#{approving?.id}</span>? Esta
            ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setApproveOpen(false)}
              className="text-color-text-secondary hover:text-color-text-primary"
            >
              Voltar
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {approveLoading ? 'Aprovando...' : 'Aprovar Venda'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
