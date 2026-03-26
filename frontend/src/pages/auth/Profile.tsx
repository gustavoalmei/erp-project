import { useEffect, useState } from "react";
import { userService } from "@/services/api";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Eye, EyeOff, KeyRound, Settings, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import type { User } from "../../types";

export function ProfilePage() {
  const { user, updateUser } = useAuth();

  // --- Perfil ---
  const [profileForm, setProfileForm] = useState({ name: "", email: "", avatar: "" });
  const [profileLoading, setProfileLoading] = useState(false);

  // --- Senha ---
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(user);

  const handleImgPerfil = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 1) {
        toast.error("Imagem muito grande. O tamanho máximo é 1MB.");
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserInfo((p) => p ? { ...p, avatar: reader.result as string } : null);
        setProfileForm((p) => ({ ...p, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, email: user.email, avatar: user.avatar ?? "" });
    }
  }, [user]);

  const handleProfileSave = async () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      toast.error("Nome e email são obrigatórios.");
      return;
    }
    try {
      setProfileLoading(true);
      const objSend = {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        avatar: profileForm.avatar,
      }
      const updated = await userService.updateProfile(objSend.name, objSend.email, objSend.avatar);
      updateUser(updated as User);
      toast.success("Perfil atualizado com sucesso.");
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? "Erro ao atualizar perfil.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Preencha todos os campos de senha.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("A nova senha e a confirmação não coincidem.");
      return;
    }
    try {
      setPasswordLoading(true);
      await userService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success("Senha alterada com sucesso.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? "Erro ao alterar senha.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Card className="p-4 border-color-border-default cursor-default">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-color-text-primary" />
        <h1 className="text-2xl font-bold text-color-text-primary">Configurações</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card: Informações do perfil */}
        <Card className="bg-color-bg-secondary border-color-border-default shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserRound className="w-5 h-5 text-color-text-secondary" />
              <CardTitle className="text-color-text-primary text-base">Informações do perfil</CardTitle>
            </div>
            <CardDescription className="text-color-text-secondary">
              Atualize seu nome e endereço de email.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2">
              <Label className="text-color-text-primary">Avatar</Label>
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  {userInfo?.avatar ? (
                    <img src={userInfo?.avatar} alt="Avatar do usuário" className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-color-primary flex items-center justify-center text-color-text-primary text-2xl font-bold">
                      {userInfo?.name.charAt(0).toUpperCase()}
                    </div>)}
                  <div className="absolute inset-0 rounded-full bg-gray-700 opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none" />
                  <Button
                    onClick={() => document.getElementById("avatarInput")?.click()}
                    className="absolute inset-0 w-full h-full rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-transparent hover:bg-transparent text-white shadow-none text-white"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <div className="hidden">
                  <Input
                    type="file"
                    id="avatarInput"
                    accept="image/*"
                    onChange={handleImgPerfil}
                    className="bg-color-surface border-color-border-default text-color-text-primary"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-color-text-primary">Nome</Label>
              <Input
                placeholder="Seu nome"
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                className="bg-color-surface border-color-border-default text-color-text-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-color-text-primary">Email</Label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={profileForm.email}
                onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                className="bg-color-surface border-color-border-default text-color-text-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-color-text-secondary text-sm">Papel</Label>
              <div className="h-10 flex items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-color-surface border border-color-border-default text-color-text-secondary">
                  {user?.role === "ADMIN" ? "Administrador" : "Usuário"}
                </span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleProfileSave}
                disabled={profileLoading}
                className="bg-color-primary hover:bg-color-primary-hover text-color-text-primary"
              >
                {profileLoading ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card: Trocar senha */}
        <Card className="bg-color-bg-secondary border-color-border-default shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-color-text-secondary" />
              <CardTitle className="text-color-text-primary text-base">Trocar senha</CardTitle>
            </div>
            <CardDescription className="text-color-text-secondary">
              Use uma senha forte com no mínimo 6 caracteres.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-color-text-primary">Senha atual</Label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  className="bg-color-surface border-color-border-default text-color-text-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-color-text-secondary hover:text-color-text-primary"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-color-text-primary">Nova senha</Label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  placeholder="••••••••"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  className="bg-color-surface border-color-border-default text-color-text-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-color-text-secondary hover:text-color-text-primary"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-color-text-primary">Confirmar nova senha</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className="bg-color-surface border-color-border-default text-color-text-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-color-text-secondary hover:text-color-text-primary"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={handlePasswordSave}
                disabled={passwordLoading}
                className="bg-color-primary hover:bg-color-primary-hover text-color-text-primary"
              >
                {passwordLoading ? "Alterando..." : "Alterar senha"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Card>
  );
}
