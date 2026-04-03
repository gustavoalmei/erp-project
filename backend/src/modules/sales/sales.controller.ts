import type { Request, Response } from 'express'
import { salesService } from './sales.service'
import { logsService } from '../logs/logs.service'

export const salesController = {
  async create(req: Request, res: Response) {
    try {
      const { customerId, items } = req.body
      const userId = req.userId!

      if (!customerId || !items || items.length === 0) {
        return res.status(400).json({
          error: 'customerId e items são obrigatórios',
        })
      }

      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({
            error: 'Cada item precisa de productId e quantity > 0',
          })
        }
      }

      const customerIdNumber = Number(customerId)
      const itemsConverted = items.map((item: { productId: number; quantity: number }) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
      }))

      await salesService.createSale(customerIdNumber, itemsConverted, userId)

      await logsService.create(
        `Venda criada para cliente #${customerId} (${items.length} item(s))`,
        userId,
      )

      return res.status(201).json({
        message: 'Venda criada com sucesso',
      })
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Cliente não encontrado') {
        return res.status(404).json({ error: error.message })
      }
      if (
        error instanceof Error &&
        error.message.includes('Produto') &&
        error.message.includes('não encontrado')
      ) {
        return res.status(404).json({ error: error.message })
      }
      if (error instanceof Error && error.message.includes('Estoque insuficiente')) {
        return res.status(400).json({ error: 'Estoque insuficiente para um ou mais produtos.' })
      }
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async list(req: Request, res: Response) {
    try {
      const sales = await salesService.listSales()
      return res.status(200).json(sales)
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)

      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      const sale = await salesService.getSaleById(id)
      return res.status(200).json(sale)
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Venda não encontrada') {
        return res.status(404).json({ error: error.message })
      }
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const { status } = req.body

      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      if (!status) {
        return res.status(400).json({ error: 'Status é obrigatório' })
      }

      await salesService.updateSaleStatus(id, status)

      await logsService.create(`Venda #${id} status atualizado: ${status}`, req.userId)

      return res.status(200).json({
        message: 'Status atualizado com sucesso',
      })
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Venda não encontrada') {
        return res.status(404).json({ error: error.message })
      }
      if (error instanceof Error && error.message.includes('Status inválido')) {
        return res.status(400).json({ error: error.message })
      }
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async cancel(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      const userId = req.userId!

      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      await salesService.cancelSale(id, userId)

      await logsService.create(`Venda #${id} cancelada`, userId)

      return res.status(200).json({
        message: 'Venda cancelada com sucesso',
      })
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Venda não encontrada') {
        return res.status(404).json({ error: error.message })
      }
      if (error instanceof Error && error.message === 'Venda já está cancelada') {
        return res.status(400).json({ error: error.message })
      }
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async getTotalRevenue(req: Request, res: Response) {
    try {
      const data = await salesService.getTotalRevenue()
      return res.status(200).json(data)
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const data = await salesService.getStats()
      return res.status(200).json(data)
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async getMonthlyRevenue(req: Request, res: Response) {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined
      const currentYear = new Date().getFullYear()
      if (year && (isNaN(year) || year < 2000 || year > currentYear + 1)) {
        return res.status(400).json({ error: 'Ano inválido.' })
      }

      const data = await salesService.getMonthlyRevenue(year)
      return res.status(200).json(data)
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async getTodaySales(req: Request, res: Response) {
    try {
      const data = await salesService.getTodaySales()
      return res.status(200).json(data)
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async getPendingSales(req: Request, res: Response) {
    try {
      const data = await salesService.getPendingSales()
      return res.status(200).json(data)
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },
}
