import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../components/ui/input-group"
import { Label } from "../../components/ui/label"
import { Separator } from "../../components/ui/separator"
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, showToast } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login({ email, password }).then(() => {
      showToast({ type: "success", message: "Login realizado com sucesso" });
      navigate('/');
    }).catch((error) => {
      showToast({ type: "error", message: error.response.data.error });
    });
  }
  return (
    <div className="min-h-svh grid lg:grid-cols-[1fr_480px]">
      <div className="hidden lg:flex flex-col justify-between bg-muted p-12 bg-neutral-400"></div>
      <div className="min-w-lg flex flex-col gap-8 items-center justify-center p-0 lg:p-4">
        <Card className="w-full max-w-full shadow-none border-none">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <CardHeader className="mb-3">
              <CardTitle className="text-2xl font-bold">Bem vindo!</CardTitle>
              <CardDescription className="text-small text-neutral-500">
                Entre com seu email e senha para acessar sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    className="rounded-xl"
                    id="email"
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <InputGroup className="rounded-xl">
                    <InputGroupInput
                      id="password"
                      placeholder="Digite sua senha"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputGroupAddon
                      align="inline-end"
                      className="cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff /> : <Eye />}
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button
                type="submit"
                className="w-full bg-neutral-400 rounded-xl text-white hover:bg-neutral-500">
                Login
              </Button>
              <Separator className="bg-neutral-200" />
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl text-white hover:bg-neutral-700"
                onClick={() => { navigate('/register') }}>
                Criar conta
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}