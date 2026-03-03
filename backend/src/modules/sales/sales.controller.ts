import { Request, Response } from "express";
import { salesService } from "./sales.service";

export const salesController = {
  async create(req: Request, res: Response) {
    try {
      const { customerId, items } = req.body;
      const userId = req.userId!;

      // Validações
      if (!customerId || !items || items.length === 0) {
        return res.status(400).json({
          error: "customerId e items são obrigatórios",
        });
      }

      // Validar cada item
      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({
            error: "Cada item precisa de productId e quantity > 0",
          });
        }
      }

      // Converter tipos
      const customerIdNumber = Number(customerId);
      const itemsConverted = items.map((item: any) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
      }));

      await salesService.createSale(customerIdNumber, itemsConverted, userId);

      return res.status(201).json({
        message: "Venda criada com sucesso",
      });
    } catch (error: any) {
      if (error.message === "Cliente não encontrado") {
        return res.status(404).json({ error: error.message });
      }
      if (
        error.message.includes("Produto") &&
        error.message.includes("não encontrado")
      ) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("Estoque insuficiente")) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const sales = await salesService.listSales();
      return res.status(200).json(sales);
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

      const sale = await salesService.getSaleById(id);
      return res.status(200).json(sale);
    } catch (error: any) {
      if (error.message === "Venda não encontrada") {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      if (!status) {
        return res.status(400).json({ error: "Status é obrigatório" });
      }

      await salesService.updateSaleStatus(id, status);

      return res.status(200).json({
        message: "Status atualizado com sucesso",
      });
    } catch (error: any) {
      if (error.message === "Venda não encontrada") {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("Status inválido")) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  },

  async cancel(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const userId = req.userId!;

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      await salesService.cancelSale(id, userId);

      return res.status(200).json({
        message: "Venda cancelada com sucesso",
      });
    } catch (error: any) {
      if (error.message === "Venda não encontrada") {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === "Venda já está cancelada") {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  },
};
