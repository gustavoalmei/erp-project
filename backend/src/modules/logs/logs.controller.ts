import type { Request, Response } from 'express'
import { logsService } from './logs.service'

export const logsController = {
  async getAll(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const logs = await logsService.getAll(req.companyId)
      return res.json(logs)
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async getByUserId(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const userId = Number(req.params.id)
      if (!userId) {
        return res.status(400).json({ error: 'ID do usuário não fornecido' })
      }
      const logs = await logsService.getByUserId(userId, req.companyId)
      return res.json(logs)
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },
}
