import type { Request, Response } from 'express'
import { dashboardService } from './dashboard.service'

export const dashboardController = {
  async show(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não selecionada' })
      const companyId = req.companyId
      const data = await dashboardService.getSummary(companyId)
      return res.json(data)
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string }
      return res.status(err.code || 500).json({ error: err.message || 'Erro interno do servidor' })
    }
  },
}
