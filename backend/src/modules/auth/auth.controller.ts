import { Request, Response } from "express";
import { authService } from "./auth.service";
import { usersService } from "../users/users.service";

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          error: "Nome, email e senha são obrigatórios",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: "Senha deve ter no mínimo 6 caracteres",
        });
      }

      const user = await authService.register(name, email, password);

      return res.status(201).json({
        message: "Usuário criado com sucesso",
        user,
      });
    } catch (error: any) {
      if (error.message === "Email já cadastrado") {
        return res.status(409).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  },

  async verify(req: Request, res: Response) {
    try {
      const user = await usersService.getProfile(req.userId!);
      return res.status(200).json({
        valid: true,
        userId: user.id,
        role: user.role,
      });
    } catch {
      return res.status(404).json({
        valid: false,
        error: "Usuário não encontrado",
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: "Email e senha são obrigatórios",
        });
      }

      if (typeof password !== "string") {
        return res.status(400).json({
          error: "Senha deve ser uma string",
        });
      }

      const result = await authService.login(email, password);

      return res.status(200).json(result);
    } catch (error: any) {
      if (error.message === "Credenciais inválidas") {
        return res.status(401).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  },

  async logout(req: Request, res: Response) {
    try {
      return res.status(200).json({
        message: "Logout realizado com sucesso",
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  },
};
