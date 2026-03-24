import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { userService } from "@/services/api";
import type { User, UserForm } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Edit, Search, Trash, Users as UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";

export function Users() {
  const { user: loggedUser, updateUser } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const users = allUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditUser = (id: number) => {
    setIsDialogOpen(true);
    setSelectedUser(allUsers.find((u) => u.id === id) || null);
  }

  const handleDeleteUser = (id: number) => {
    setIsDeleteDialogOpen(true);
    setSelectedUser(allUsers.find((u) => u.id === id) || null);
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selectedUser) {
        const updated = await userService.update(selectedUser.id, selectedUser);
        if (loggedUser && updated.id === loggedUser.id) {
          updateUser(updated);
        }
      }
      setIsDialogOpen(false);
      loadUsers();
      toast.success("Usuário atualizado com sucesso");
    } catch (error: any) {
      toast.error(error.response.data.error);
    } finally {
      setSaving(false);
    }
  }

  const handleDelete = async () => {
    setSaving(true);
    try {
      if (selectedUser) {
        await userService.delete(selectedUser.id);
      }
      setIsDeleteDialogOpen(false);
      loadUsers();
      toast.success("Usuário deletado com sucesso");
    } catch (error: any) {
      toast.error(error.response.data.error);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAll();
      setAllUsers(response.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
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
            {loading ? "Carregando..." : `${users.length} usuários`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
                    <TableCell className="text-color-text-primary font-medium">{user.name}</TableCell>
                    <TableCell className="text-color-text-primary">{user.email}</TableCell>
                    <TableCell className="text-color-text-primary">
                      <Badge variant="outline" className={`${user.role === "ADMIN" ? "text-red-300" : "text-green-300"} bg-color-surface border-color-border-default`}>
                        {user.role === "ADMIN" ? "Administrador" : "Usuário"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex items-center gap-2 text-color-text-primary">
                      <Edit className="w-4 h-4 text-color-text-primary cursor-pointer" onClick={() => handleEditUser(user.id)} />
                      <Trash className="w-4 h-4 text-color-text-primary cursor-pointer" onClick={() => handleDeleteUser(user.id)} />
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
            <DialogTitle className="text-color-text-primary">
              Editar Usuário
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label className="text-color-text-primary">Nome</Label>
              <Input
                placeholder="Nome do usuário"
                value={selectedUser?.name}
                onChange={(e) => setSelectedUser({ ...selectedUser as User, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                className="bg-color-surface border-color-border-default text-color-text-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-color-text-primary">Email</Label>
              <Input
                placeholder="Email do usuário"
                value={selectedUser?.email}
                onChange={(e) => setSelectedUser({ ...selectedUser as User, email: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                className="bg-color-surface border-color-border-default text-color-text-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-color-text-primary">Perfil</Label>
              <Select
                value={selectedUser?.role}
                onValueChange={(e) => setSelectedUser({ ...selectedUser as User, role: e as "ADMIN" | "USER" })}
              >
                <SelectTrigger className="bg-color-surface border-color-border-default text-color-text-primary w-full">
                  <SelectValue placeholder="Perfil do usuário" />
                </SelectTrigger>
                <SelectContent position="popper" className="bg-color-bg-secondary text-color-text-primary">
                  <SelectItem value="ADMIN" className="hover:bg-color-primary-hover cursor-pointer">Administrador</SelectItem>
                  <SelectItem value="USER" className="hover:bg-color-primary-hover cursor-pointer">Usuário</SelectItem>
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
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Deletar Usuário */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-color-bg-secondary border-color-border-default">
          <DialogHeader>
            <DialogTitle className="text-color-text-primary">
              Deletar Usuário
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <p className="text-color-text-primary">Tem certeza que deseja deletar o usuário {selectedUser?.name}?</p>
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
              {saving ? "Deletando..." : "Deletar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}