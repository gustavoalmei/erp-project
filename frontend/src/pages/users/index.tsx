import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { userService } from '@/services/api'
import { getRoleLabel, getRoleColor } from '@/utils/document'
import type { User, UserForm, ActivityLog } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { Edit, Eye, Search, Trash, Users as UsersIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'react-toastify'

export function Users() {
  const { user: loggedUser, updateUser } = useAuth()
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  const users = allUsers.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))

  const handleEditUser = (id: number) => {
    if (loggedUser?.role !== 'ADMIN') {
      toast.error('Você não tem permissão para editar usuários')
      return
    }
    setIsDialogOpen(true)
    setSelectedUser(allUsers.find((u) => u.id === id) || null)
  }

  const handleDeleteUser = (id: number) => {
    if (loggedUser?.role !== 'ADMIN') {
      toast.error('Você não tem permissão para deletar usuários')
      return
    }
    setIsDeleteDialogOpen(true)
    setSelectedUser(allUsers.find((u) => u.id === id) || null)
  }

  const handleViewUser = async (id: number) => {
    if (loggedUser?.role !== 'ADMIN') {
      toast.error('Você não tem permissão para ver usuários')
      return
    }
    setSelectedUser(allUsers.find((u) => u.id === id) || null)
    setIsViewDialogOpen(true)
    setLoadingLogs(true)
    try {
      const data = await userService.getLogsByUser(id)
      setLogs(data)
    } catch {
      toast.error('Erro ao carregar logs do usuário')
      setLogs([])
    } finally {
      setLoadingLogs(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (selectedUser) {
        const updated = await userService.update(selectedUser.id, selectedUser)
        if (loggedUser && updated.id === loggedUser.id) {
          updateUser(updated)
        }
      }
      setIsDialogOpen(false)
      loadUsers()
      toast.success('Usuário atualizado com sucesso')
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } }
      toast.error(axiosError.response?.data?.error || 'Erro ao atualizar usuário')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      if (selectedUser) {
        await userService.delete(selectedUser.id)
      }
      setIsDeleteDialogOpen(false)
      loadUsers()
      toast.success('Usuário deletado com sucesso')
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } }
      toast.error(axiosError.response?.data?.error || 'Erro ao deletar usuário')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await userService.getAll()
      setAllUsers(response.sort((a, b) => a.name.localeCompare(b.name)))
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } }
      toast.error(axiosError.response?.data?.error || 'Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-4 border-color-border-default cursor-default">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UsersIcon className="w-6 h-6 text-color-text-primary" />
          <h1 className="text-2xl font-bold text-color-text-primary">Usuários</h1>
        </div>
      </div>

      {/* Busca */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-color-text-secondary" />
        <Input
          placeholder="Buscar usuário..."
          className="pl-9 bg-color-surface border-color-border-default text-color-text-primary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabela */}
      <Card className="border-color-border-default shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-color-text-primary text-base">
            {loading ? 'Carregando...' : `${users.length} usuários`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-color-text-secondary py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-color-text-secondary py-8">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-color-text-primary font-medium">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Avatar do usuário"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-color-primary flex items-center justify-center text-color-text-primary text-lg font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-color-text-primary font-medium">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-color-text-primary">{user.email}</TableCell>
                    <TableCell className="text-color-text-primary">
                      <Badge
                        variant="outline"
                        className={`${getRoleColor(user.role)} bg-color-surface border-color-border-default`}
                      >
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-color-text-primary">
                      <div className="flex items-center gap-2">
                        <Edit
                          className="w-4 h-4 text-color-text-primary cursor-pointer"
                          onClick={() => handleEditUser(user.id)}
                        />
                        <Trash
                          className="w-4 h-4 text-color-text-primary cursor-pointer"
                          onClick={() => handleDeleteUser(user.id)}
                        />
                        <Eye
                          className="w-4 h-4 text-color-text-primary cursor-pointer"
                          onClick={() => handleViewUser(user.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Criar/Editar Usuário */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-color-bg-secondary border-color-border-default text-color-text-primary">
          <DialogHeader>
            <DialogTitle className="text-color-text-primary">Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label className="text-color-text-primary">Nome</Label>
              <Input
                placeholder="Nome do usuário"
                value={selectedUser?.name}
                onChange={(e) =>
                  setSelectedUser({ ...(selectedUser as User), name: e.target.value })
                }
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="bg-color-surface border-color-border-default text-color-text-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-color-text-primary">Email</Label>
              <Input
                placeholder="Email do usuário"
                value={selectedUser?.email}
                onChange={(e) =>
                  setSelectedUser({ ...(selectedUser as User), email: e.target.value })
                }
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="bg-color-surface border-color-border-default text-color-text-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-color-text-primary">Perfil</Label>
              <Select
                value={selectedUser?.role}
                onValueChange={(e) =>
                  setSelectedUser({ ...(selectedUser as User), role: e as User['role'] })
                }
              >
                <SelectTrigger className="bg-color-surface border-color-border-default text-color-text-primary w-full">
                  <SelectValue placeholder="Perfil do usuário" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="bg-color-bg-secondary text-color-text-primary"
                >
                  <SelectItem value="ADMIN" className="hover:bg-color-primary-hover cursor-pointer">
                    Administrador
                  </SelectItem>
                  <SelectItem
                    value="MANAGER"
                    className="hover:bg-color-primary-hover cursor-pointer"
                  >
                    Gestor
                  </SelectItem>
                  <SelectItem
                    value="SUPERVISOR"
                    className="hover:bg-color-primary-hover cursor-pointer"
                  >
                    Supervisor
                  </SelectItem>
                  <SelectItem
                    value="OPERATOR"
                    className="hover:bg-color-primary-hover cursor-pointer"
                  >
                    Operador
                  </SelectItem>
                  <SelectItem
                    value="VIEWER"
                    className="hover:bg-color-primary-hover cursor-pointer"
                  >
                    Visualizador
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
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

      {/* Modal Deletar Usuário */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-color-bg-secondary border-color-border-default">
          <DialogHeader>
            <DialogTitle className="text-color-text-primary">Deletar Usuário</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <p className="text-color-text-primary">
                Tem certeza que deseja deletar o usuário {selectedUser?.name}?
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-color-text-secondary hover:text-color-text-primary"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={saving}
              className="bg-color-primary hover:bg-color-primary-hover text-color-text-primary"
            >
              {saving ? 'Deletando...' : 'Deletar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Logs do usuário selecionado */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-color-bg-secondary border-color-border-default max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-color-text-primary">
              Logs de {selectedUser?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-color-text-secondary w-[180px]">Data</TableHead>
                  <TableHead className="text-color-text-secondary">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingLogs ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-color-text-secondary py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-color-text-secondary py-8">
                      Nenhum log encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-color-text-secondary text-sm whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-color-text-primary text-sm">
                        {log.message}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsViewDialogOpen(false)}
              className="bg-color-primary hover:bg-color-primary-hover text-color-text-primary"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
