import type { Request, Response } from 'express'
import { usersService } from './users.service'
import { logsService } from '../logs/logs.service'

export const usersController = {
  async getProfile(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const user = await usersService.getProfile(req.userId!, req.companyId)
      return res.json(user)
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string }
      return res.status(err.code || 500).json({ error: err.message || 'Erro interno do servidor' })
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const { name, email, avatar } = req.body
      if (!name || !email || !avatar) {
        return res.status(400).json({ error: 'Nome, email e avatar são obrigatórios' })
      }
      const isValidBase64 = /^data:image\/(png|jpg|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(avatar)
      if (!isValidBase64) {
        return res.status(400).json({ error: 'Avatar deve ser uma imagem em base64 válida' })
      }
      const MAX_AVATAR_SIZE = 2 * 1024 * 1024
      const base64Data = avatar.split(',')[1] ?? ''
      const sizeInBytes = Math.ceil((base64Data.length * 3) / 4)
      if (sizeInBytes > MAX_AVATAR_SIZE) {
        return res.status(400).json({ error: 'Avatar deve ter no máximo 2MB.' })
      }
      const user = await usersService.updateProfile(req.userId!, name, email, avatar)

      await logsService.create(`Perfil atualizado: ${email}`, req.userId, req.companyId)

      return res.json(user)
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string }
      return res.status(err.code || 500).json({ error: err.message || 'Erro interno do servidor' })
    }
  },

  async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' })
      }
      const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{12,}$/
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          error:
            'Nova senha deve ter no mínimo 12 caracteres, uma maiúscula, um número e um símbolo.',
        })
      }
      await usersService.changePassword(req.userId!, currentPassword, newPassword)

      await logsService.create('Senha alterada', req.userId, req.companyId)

      return res.json({ message: 'Senha alterada com sucesso' })
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string }
      return res.status(err.code || 500).json({ error: err.message || 'Erro interno do servidor' })
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const users = await usersService.getAll(req.companyId)
      return res.json(users)
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async updateUser(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const id = parseInt(req.params.id as string)
      if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })

      const { name, email, role } = req.body
      if (!name || !email || !role) {
        return res.status(400).json({ error: 'Nome, email e perfil são obrigatórios' })
      }
      if (!['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR', 'VIEWER'].includes(role)) {
        return res.status(400).json({ error: 'Perfil inválido' })
      }

      const user = await usersService.updateUser(id, name, email, role, req.companyId)

      await logsService.create(`Usuário #${id} atualizado (perfil: ${role})`, req.userId, req.companyId)

      return res.json(user)
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string }
      return res.status(err.code || 500).json({ error: err.message || 'Erro interno do servidor' })
    }
  },

  async deleteUser(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const id = parseInt(req.params.id as string)
      if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })

      await usersService.deleteUser(id, req.companyId)

      await logsService.create(`Usuário #${id} removido`, req.userId, req.companyId)

      return res.status(204).send()
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string }
      return res.status(err.code || 500).json({ error: err.message || 'Erro interno do servidor' })
    }
  },
}
