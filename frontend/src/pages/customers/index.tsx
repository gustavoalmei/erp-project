import { useEffect, useState } from 'react'
import { customerService } from '@/services/api'
import type { Customer } from '../../types'
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
import { Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import { toast } from 'react-toastify'
import { CustomerFormDialog } from '@/components/forms/CustomerFormDialog'

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filtered, setFiltered] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState<Customer | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const data = await customerService.getAll()
      setCustomers(data.sort((a, b) => a.name.localeCompare(b.name)))
      setFiltered(data)
    } catch {
      toast.error('Erro ao carregar clientes.')
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
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.document.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q),
      ),
    )
  }, [search, customers])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (customer: Customer) => {
    setEditing(customer)
    setFormOpen(true)
  }

  const openDelete = (customer: Customer) => {
    setDeleting(customer)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      setDeleteLoading(true)
      await customerService.delete(deleting.id)
      toast.success('Cliente excluído com sucesso.')
      setDeleteOpen(false)
      setDeleting(null)
      load()
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } }
      toast.error(axiosError.response?.data?.error || 'Erro ao excluir cliente.')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <Card className="p-4 border-color-border-default cursor-default">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-color-text-primary" />
          <h1 className="text-2xl font-bold text-color-text-primary">Clientes</h1>
        </div>
        <Button
          onClick={openCreate}
          className="flex items-center gap-2 bg-color-primary hover:bg-color-primary-hover text-color-text-primary"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Busca */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-color-text-secondary" />
        <Input
          placeholder="Buscar por nome, e-mail, CPF/CNPJ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-color-surface border-color-border-default text-color-text-primary"
        />
      </div>

      {/* Tabela */}
      <Card className="border-color-border-default shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-color-text-primary text-base">
            {loading ? 'Carregando...' : `${filtered.length} clientes`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-color-border-default">
                <TableHead className="text-color-text-primary">Nome</TableHead>
                <TableHead className="text-color-text-primary">E-mail</TableHead>
                <TableHead className="text-color-text-primary">Telefone</TableHead>
                <TableHead className="text-color-text-primary">CPF/CNPJ</TableHead>
                <TableHead className="text-color-text-primary">Endereço</TableHead>
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
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((customer) => (
                  <TableRow key={customer.id} className="border-color-border-default">
                    <TableCell className="text-color-text-primary font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell className="text-color-text-secondary">{customer.email}</TableCell>
                    <TableCell className="text-color-text-secondary">{customer.phone}</TableCell>
                    <TableCell className="text-color-text-primary font-mono text-sm">
                      {customer.document}
                    </TableCell>
                    <TableCell className="text-color-text-secondary">
                      {customer.address ?? '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(customer)}
                          className="text-color-text-secondary hover:text-color-text-primary hover:bg-color-surface"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDelete(customer)}
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

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={load}
      />

      {/* Modal: Confirmar exclusão */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-color-bg-secondary border-color-border-default">
          <DialogHeader>
            <DialogTitle className="text-color-text-primary">Excluir Cliente</DialogTitle>
          </DialogHeader>
          <p className="text-color-text-secondary">
            Tem certeza que deseja excluir o cliente{' '}
            <span className="font-semibold text-color-text-primary">"{deleting?.name}"</span>? Esta
            ação não pode ser desfeita.
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
              {deleteLoading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
