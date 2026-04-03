import type { Request, Response } from 'express'
import { logsService } from './logs.service'

export const logsController = {
  async getAll(_req: Request, res: Response) {
    try {
      const logs = await logsService.getAll()
      return res.json(logs)
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },
  async getByUserId(req: Request, res: Response) {
    try {
      const userId = Number(req.params.id)
      if (!userId) {
        return res.status(400).json({ error: 'ID do usuário não fornecido' })
      }
      const logs = await logsService.getByUserId(userId)
      return res.json(logs)
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },
}
