import { useEffect, useState } from 'react'
import { categoryService } from '@/services/api'
import type { Category } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Pencil, Plus, Search, Tags, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filtered, setFiltered] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Modal de criação/edição
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [formName, setFormName] = useState('')
  const [saving, setSaving] = useState(false)

  // Modal de confirmação de exclusão
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const data = await categoryService.getAll()
      setCategories(data.sort((a, b) => a.name.localeCompare(b.name)))
      setFiltered(data.sort((a, b) => a.name.localeCompare(b.name)))
    } catch {
      toast.error('Erro ao carregar categorias.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(categories.filter((c) => c.name.toLowerCase().includes(q)))
  }, [search, categories])

  const openCreate = () => {
    setEditing(null)
    setFormName('')
    setFormOpen(true)
  }

  const openEdit = (category: Category) => {
    setEditing(category)
    setFormName(category.name)
    setFormOpen(true)
  }

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Nome é obrigatório.')
      return
    }
    try {
      setSaving(true)
      if (editing) {
        await categoryService.update(editing.id, formName.trim())
        toast.success('Categoria atualizada com sucesso.')
      } else {
        await categoryService.create(formName.trim())
        toast.success('Categoria criada com sucesso.')
      }
      setFormOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar categoria.')
    } finally {
      setSaving(false)
    }
  }

  const openDelete = (category: Category) => {
    setDeleting(category)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      setDeleteLoading(true)
      await categoryService.delete(deleting.id)
      toast.success('Categoria excluída com sucesso.')
      setDeleteOpen(false)
      setDeleting(null)
      load()
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } }
      toast.error(axiosError.response?.data?.error)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <Card className="p-4 border-color-border-default cursor-default">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tags className="w-6 h-6 text-color-text-primary" />
          <h1 className="text-2xl font-bold text-color-text-primary">Categorias</h1>
        </div>
        <Button
          onClick={openCreate}
          className="flex items-center gap-2 bg-color-primary hover:bg-color-primary-hover text-color-text-primary"
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Busca */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-color-text-secondary" />
        <Input
          placeholder="Buscar categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-color-surface border-color-border-default text-color-text-primary"
        />
      </div>

      {/* Tabela */}
      <Card className="bg-color-bg-secondary border-color-border-default shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-color-text-primary text-base">
            {loading ? 'Carregando...' : `${filtered.length} categorias`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-color-border-default">
                <TableHead className="text-color-text-secondary">Nome</TableHead>
                <TableHead className="text-color-text-secondary text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-color-text-secondary py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-color-text-secondary py-8">
                    Nenhuma categoria encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((category) => (
                  <TableRow key={category.id} className="border-color-border-default">
                    <TableCell className="text-color-text-primary font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(category)}
                          className="text-color-text-secondary hover:text-color-text-primary hover:bg-color-surface"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDelete(category)}
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
        <DialogContent className="bg-color-bg-secondary border-color-border-default text-color-text-primary">
          <DialogHeader>
            <DialogTitle className="text-color-text-primary">
              {editing ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label className="text-color-text-primary">Nome</Label>
              <Input
                placeholder="Nome da categoria"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="bg-color-surface border-color-border-default text-color-text-primary"
              />
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
              className="bg-color-primary hover:bg-color-primary-hover text-color-text-primary"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmar exclusão */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-color-bg-secondary border-color-border-default text-color-text-primary">
          <DialogHeader>
            <DialogTitle className="text-color-text-primary">Excluir Categoria</DialogTitle>
          </DialogHeader>
          <p className="text-color-text-secondary">
            Tem certeza que deseja excluir a categoria{' '}
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
