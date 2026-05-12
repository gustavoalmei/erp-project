import type { Request, Response } from 'express'
import { productsService } from './products.service'
import { logsService } from '../logs/logs.service'

export const productsController = {
  async list(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const products = await productsService.allProducts(req.companyId)
      return res.status(200).json(products)
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async getById(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const id = Number(req.params.id)

      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      const product = await productsService.getProductById(id, req.companyId)
      return res.status(200).json(product)
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Produto não encontrado') {
        return res.status(404).json({ error: error.message })
      }
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async create(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const { name, description, price, stock, sku, categoryId } = req.body

      if (!name || !price || !sku || !categoryId) {
        return res.status(400).json({
          error: 'Campos obrigatórios: name, price, sku, categoryId',
        })
      }

      const priceNumber = Number(price)
      const stockNumber = Number(stock || 0)
      const categoryIdNumber = Number(categoryId)

      if (isNaN(priceNumber) || isNaN(categoryIdNumber)) {
        return res.status(422).json({
          error: 'Price e categoryId devem ser números válidos',
        })
      }

      if (priceNumber <= 0) {
        return res.status(400).json({ error: 'Preço deve ser maior que zero' })
      }

      if (stockNumber < 0) {
        return res.status(400).json({ error: 'Estoque não pode ser negativo' })
      }

      const product = await productsService.createProduct(
        name,
        description,
        priceNumber,
        stockNumber,
        sku,
        categoryIdNumber,
        req.companyId,
      )

      await logsService.create(`Produto criado: ${name} (SKU: ${sku})`, req.userId, req.companyId)

      return res.status(201).json({ message: 'Produto criado com sucesso', product })
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'SKU já cadastrado') {
        return res.status(409).json({ error: error.message })
      }
      if (error instanceof Error && error.message === 'Categoria não encontrada') {
        return res.status(404).json({ error: error.message })
      }
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async update(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const id = Number(req.params.id)
      const { name, description, price, stock, sku, categoryId } = req.body

      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' })
      }

      if (!name || !price || !sku || !categoryId) {
        return res.status(400).json({
          error: 'Campos obrigatórios: name, price, sku, categoryId',
        })
      }

      const priceNumber = Number(price)
      const stockNumber = Number(stock || 0)
      const categoryIdNumber = Number(categoryId)

      if (isNaN(priceNumber) || isNaN(categoryIdNumber)) {
        return res.status(422).json({
          error: 'Price e categoryId devem ser números válidos',
        })
      }

      if (priceNumber <= 0) {
        return res.status(400).json({ error: 'Preço deve ser maior que zero' })
      }

      if (stockNumber < 0) {
        return res.status(400).json({ error: 'Estoque não pode ser negativo' })
      }

      const product = await productsService.updateProduct(
        id,
        name,
        description,
        priceNumber,
        stockNumber,
        sku,
        categoryIdNumber,
        req.companyId,
      )

      await logsService.create(`Produto #${id} atualizado: ${name}`, req.userId, req.companyId)

      return res.status(200).json({ message: 'Produto atualizado com sucesso', product })
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Produto não encontrado') {
        return res.status(404).json({ error: error.message })
      }
      if (error instanceof Error && error.message === 'SKU já está em uso') {
        return res.status(409).json({ error: error.message })
      }
      if (error instanceof Error && error.message === 'Categoria não encontrada') {
        return res.status(404).json({ error: error.message })
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

      const result = await productsService.deleteProduct(id, req.companyId)

      await logsService.create(`Produto #${id} removido`, req.userId, req.companyId)

      return res.status(200).json(result)
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Produto não encontrado') {
        return res.status(404).json({ error: error.message })
      }
      if (error instanceof Error && error.message === 'Produto possui vendas vinculadas') {
        return res.status(400).json({ error: error.message })
      }
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async topSelling(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const limit = parseInt(req.query.limit as string, 10)
      if (isNaN(limit) || limit < 1 || limit > 20) {
        return res.status(400).json({ error: 'Limit deve ser entre 1 e 20.' })
      }

      const products = await productsService.topSelling(limit, req.companyId)
      return res.status(200).json(products)
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async getLowStock(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const threshold = Number(req.query.threshold) || 10

      if (threshold < 1) {
        return res.status(400).json({ error: 'Threshold deve ser maior que 0' })
      }

      const data = await productsService.getLowStock(threshold, req.companyId)
      return res.status(200).json(data)
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },
}
