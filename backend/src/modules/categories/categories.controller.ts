import { type Request, type Response } from 'express'
import { categoriesService } from './categories.service'
import { logsService } from '../logs/logs.service'

export const categoriesController = {
  async list(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const categories = await categoriesService.allCategories(req.companyId)
      return res.status(200).json(categories)
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

      const category = await categoriesService.getCategoryById(id, req.companyId)
      return res.status(200).json(category)
    } catch (error) {
      const err = error as Error
      if (err.message === 'Categoria não encontrada') {
        return res.status(404).json({ error: err.message })
      }
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async create(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const { name } = req.body

      if (!name) {
        return res.status(400).json({ error: 'Nome é obrigatório' })
      }

      const category = await categoriesService.createCategory(name, req.companyId)

      await logsService.create(`Categoria criada: ${name}`, req.userId, req.companyId)

      return res.status(201).json({
        message: 'Categoria criada com sucesso',
        category,
      })
    } catch (error) {
      const err = error as Error
      if (err.message === 'Categoria já cadastrada') {
        return res.status(409).json({ error: err.message })
      }
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async update(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const id = Number(req.params.id)
      const { name } = req.body

      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      if (!name) {
        return res.status(400).json({ error: 'Nome é obrigatório' })
      }

      const category = await categoriesService.updateCategory(id, name, req.companyId)

      await logsService.create(`Categoria #${id} atualizada: ${name}`, req.userId, req.companyId)

      return res.status(200).json({
        message: 'Categoria atualizada com sucesso',
        category,
      })
    } catch (error) {
      const err = error as Error
      if (err.message === 'Categoria não encontrada') {
        return res.status(404).json({ error: err.message })
      }
      if (err.message === 'Nome já está em uso') {
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

      const result = await categoriesService.deleteCategory(id, req.companyId)

      await logsService.create(`Categoria #${id} removida`, req.userId, req.companyId)

      return res.status(200).json(result)
    } catch (error) {
      const err = error as Error
      if (err.message === 'Categoria não encontrada') {
        return res.status(404).json({ error: err.message })
      }
      if (err.message === 'Categoria possui produtos vinculados') {
        return res.status(400).json({ error: err.message })
      }
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },
}
