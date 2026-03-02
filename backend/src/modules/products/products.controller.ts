import { Request, Response } from "express";
import { productsService } from "./products.service";

export const productsController = {
  async list(req: Request, res: Response) {
    try {
      const products = await productsService.allProducts();
      return res.status(200).json(products);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const product = await productsService.getProductById(id);
      return res.status(200).json(product);
    } catch (error: any) {
      if (error.message === "Produto não encontrado") {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, description, price, stock, sku, categoryId } = req.body;

      if (!name || !price || !sku || !categoryId) {
        return res.status(400).json({
          error: "Campos obrigatórios: name, price, sku, categoryId",
        });
      }

      const priceNumber = Number(price);
      const stockNumber = Number(stock || 0);
      const categoryIdNumber = Number(categoryId);

      if (isNaN(priceNumber) || isNaN(categoryIdNumber)) {
        return res.status(422).json({
          error: "Price e categoryId devem ser números válidos",
        });
      }

      if (priceNumber <= 0) {
        return res.status(400).json({
          error: "Preço deve ser maior que zero",
        });
      }

      if (stockNumber < 0) {
        return res.status(400).json({
          error: "Estoque não pode ser negativo",
        });
      }

      const product = await productsService.createProduct(
        name,
        description,
        priceNumber,
        stockNumber,
        sku,
        categoryIdNumber,
      );

      return res.status(201).json({
        message: "Produto criado com sucesso",
        product,
      });
    } catch (error: any) {
      if (error.message === "SKU já cadastrado") {
        return res.status(409).json({ error: error.message });
      }
      if (error.message === "Categoria não encontrada") {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { name, description, price, stock, sku, categoryId } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      if (!name || !price || !sku || !categoryId) {
        return res.status(400).json({
          error: "Campos obrigatórios: name, price, sku, categoryId",
        });
      }

      const priceNumber = Number(price);
      const stockNumber = Number(stock || 0);
      const categoryIdNumber = Number(categoryId);

      if (isNaN(priceNumber) || isNaN(categoryIdNumber)) {
        return res.status(422).json({
          error: "Price e categoryId devem ser números válidos",
        });
      }

      if (priceNumber <= 0) {
        return res.status(400).json({
          error: "Preço deve ser maior que zero",
        });
      }

      if (stockNumber < 0) {
        return res.status(400).json({
          error: "Estoque não pode ser negativo",
        });
      }

      const product = await productsService.updateProduct(
        id,
        name,
        description,
        priceNumber,
        stockNumber,
        sku,
        categoryIdNumber,
      );

      return res.status(200).json({
        message: "Produto atualizado com sucesso",
        product,
      });
    } catch (error: any) {
      if (error.message === "Produto não encontrado") {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === "SKU já está em uso") {
        return res.status(409).json({ error: error.message });
      }
      if (error.message === "Categoria não encontrada") {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const result = await productsService.deleteProduct(id);
      return res.status(200).json(result);
    } catch (error: any) {
      if (error.message === "Produto não encontrado") {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === "Produto possui vendas vinculadas") {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  },
};
