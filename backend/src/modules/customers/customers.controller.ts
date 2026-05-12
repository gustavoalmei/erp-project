import type { Request, Response } from 'express'
import { customersService } from './customers.service'
import { logsService } from '../logs/logs.service'

export const customersController = {
  async list(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const customers = await customersService.allCustomers(req.companyId)
      return res.status(200).json(customers)
    } catch (error) {
      const err = error as Error
      return res.status(500).json({ error: err.message })
    }
  },

  async getById(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const id = Number(req.params.id)

      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      const customer = await customersService.getCustomerById(id, req.companyId)
      return res.status(200).json(customer)
    } catch (error) {
      const err = error as Error
      if (err.message === 'Cliente não encontrado') {
        return res.status(404).json({ error: err.message })
      }
      return res.status(500).json({ error: err.message })
    }
  },

  async create(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const { name, email, phone, document, address } = req.body

      if (!name || !email || !phone || !document) {
        return res.status(400).json({
          error: 'Campos obrigatórios: name, email, phone, document',
        })
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email inválido' })
      }

      await customersService.createCustomer(name, email, phone, document, req.companyId, address)

      await logsService.create(`Cliente criado: ${name} (${email})`, req.userId, req.companyId)

      return res.status(201).json({ message: 'Cliente criado com sucesso' })
    } catch (error) {
      const err = error as Error
      if (err.message === 'Email já cadastrado' || err.message === 'Documento já cadastrado') {
        return res.status(409).json({ error: err.message })
      }
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async update(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const id = Number(req.params.id)
      const { name, email, phone, document, address } = req.body

      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      if (!name || !email || !phone || !document) {
        return res.status(400).json({
          error: 'Campos obrigatórios: name, email, phone, document',
        })
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email inválido' })
      }

      await customersService.updateCustomer(id, name, email, phone, document, req.companyId, address)

      await logsService.create(`Cliente #${id} atualizado: ${name}`, req.userId, req.companyId)

      return res.status(200).json({ message: 'Cliente atualizado com sucesso' })
    } catch (error) {
      const err = error as Error
      if (err.message === 'Cliente não encontrado') {
        return res.status(404).json({ error: err.message })
      }
      if (err.message === 'Email já está em uso' || err.message === 'Documento já está em uso') {
        return res.status(409).json({ error: err.message })
      }
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async delete(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const id = Number(req.params.id)

      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      const result = await customersService.deleteCustomer(id, req.companyId)

      await logsService.create(`Cliente #${id} removido`, req.userId, req.companyId)

      return res.status(200).json(result)
    } catch (error) {
      const err = error as Error
      if (err.message === 'Cliente não encontrado') {
        return res.status(404).json({ error: err.message })
      }
      if (err.message === 'Cliente possui vendas vinculadas') {
        return res.status(400).json({ error: err.message })
      }
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async topCustomers(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const limit = Number(req.query.limit) || 10

      if (limit < 1 || limit > 20) {
        return res.status(400).json({ error: 'Limit deve ser entre 1 e 20' })
      }

      const customers = await customersService.topCustomers(limit, req.companyId)
      return res.status(200).json(customers)
    } catch (error) {
      const err = error as Error
      return res.status(500).json({ error: err.message })
    }
  },
}
