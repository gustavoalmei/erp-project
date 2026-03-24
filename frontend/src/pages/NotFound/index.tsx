import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function NotFound() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/not-found", { replace: true });
  }, []);
  return (
    <Card className="h-svh p-4 
    rounded-none
    bg-color-bg-primary dark:bg-color-bg-secondary 
    border-color-border-default 
    cursor-default 
    flex flex-col items-center justify-center">
      <h1 className="text-9xl font-bold text-color-text-primary">404</h1>
      <p className="text-color-text-secondary">Página não encontrada</p>
      <Button
        className="flex items-center gap-2 
        bg-color-primary hover:bg-color-primary-hover 
        text-color-text-inverse dark:text-color-text-primary"
        onClick={() => navigate('/dashboard')}
      >
        Voltar para o Dashboard
      </Button>
    </Card>
  );
}