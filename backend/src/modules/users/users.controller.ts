import { Request, Response } from "express";
import { usersService } from "./users.service";

export const usersController = {
  async getProfile(req: Request, res: Response) {
    try {
      const user = await usersService.getProfile(req.userId!);
      return res.json(user);
    } catch (error: any) {
      return res
        .status(error.code || 500)
        .json({ error: error.message || "Erro interno do servidor" });
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const { name, email } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: "Nome e email são obrigatórios" });
      }
      const user = await usersService.updateProfile(req.userId!, name, email);
      return res.json(user);
    } catch (error: any) {
      return res
        .status(error.code || 500)
        .json({ error: error.message || "Erro interno do servidor" });
    }
  },

  async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ error: "Senha atual e nova senha são obrigatórias" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Nova senha deve ter no mínimo 6 caracteres" });
      }
      await usersService.changePassword(
        req.userId!,
        currentPassword,
        newPassword,
      );
      return res.json({ message: "Senha alterada com sucesso" });
    } catch (error: any) {
      return res
        .status(error.code || 500)
        .json({ error: error.message || "Erro interno do servidor" });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const users = await usersService.getAll();
      return res.json(users);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  },

  async updateUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

      const { name, email, role } = req.body;
      if (!name || !email || !role) {
        return res
          .status(400)
          .json({ error: "Nome, email e perfil são obrigatórios" });
      }
      if (!["ADMIN", "USER"].includes(role)) {
        return res.status(400).json({ error: "Perfil inválido" });
      }

      const user = await usersService.updateUser(id, name, email, role);
      return res.json(user);
    } catch (error: any) {
      return res
        .status(error.code || 500)
        .json({ error: error.message || "Erro interno do servidor" });
    }
  },

  async deleteUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

      await usersService.deleteUser(id);
      return res.status(204).send();
    } catch (error: any) {
      return res
        .status(error.code || 500)
        .json({ error: error.message || "Erro interno do servidor" });
    }
  },
};
