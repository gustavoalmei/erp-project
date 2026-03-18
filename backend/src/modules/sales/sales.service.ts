import { prisma } from "../../utils/prisma";
import { MovementType } from "@prisma/client";

interface CreateSaleItem {
  productId: number;
  quantity: number;
}

export const salesService = {
  async createSale(
    customerId: number,
    items: CreateSaleItem[],
    userId: number,
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Validar cliente
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw new Error("Cliente não encontrado");
      }

      // 2. Validar produtos e calcular valores
      let totalSale = 0;
      const saleItemsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Produto ${item.productId} não encontrado`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}, Solicitado: ${item.quantity}`,
          );
        }

        const subtotal = Number(product.price) * item.quantity;
        totalSale += subtotal;

        saleItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal: subtotal,
        });
      }

      // 3. Criar a venda
      const sale = await tx.sale.create({
        data: {
          customerId,
          userId,
          total: totalSale,
          status: "PENDING",
        },
      });

      // 4. Criar itens, atualizar estoque e registrar movimentações
      for (const itemData of saleItemsData) {
        // Criar item da venda
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: itemData.productId,
            quantity: itemData.quantity,
            unitPrice: itemData.unitPrice,
            subtotal: itemData.subtotal,
          },
        });

        // Atualizar estoque
        await tx.product.update({
          where: { id: itemData.productId },
          data: {
            stock: {
              decrement: itemData.quantity,
            },
          },
        });

        // Criar movimentação de estoque
        await tx.stockMovement.create({
          data: {
            productId: itemData.productId,
            type: MovementType.OUT,
            quantity: itemData.quantity,
            reason: `Venda #${sale.id}`,
            userId,
          },
        });
      }

      // 5. Retornar venda completa
      return await tx.sale.findUnique({
        where: { id: sale.id },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  sku: true,
                },
              },
            },
          },
        },
      });
    });
  },

  async listSales() {
    return await prisma.sale.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async getSaleById(id: number) {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      throw new Error("Venda não encontrada");
    }

    return sale;
  },

  async updateSaleStatus(id: number, status: string) {
    const validStatuses = ["PENDING", "COMPLETED", "CANCELLED"];

    if (!validStatuses.includes(status)) {
      throw new Error("Status inválido. Use: PENDING, COMPLETED ou CANCELLED");
    }

    const sale = await prisma.sale.findUnique({
      where: { id },
    });

    if (!sale) {
      throw new Error("Venda não encontrada");
    }

    return await prisma.sale.update({
      where: { id },
      data: { status: status as any },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  },

  async cancelSale(id: number, userId: number) {
    return await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!sale) {
        throw new Error("Venda não encontrada");
      }

      if (sale.status === "CANCELLED") {
        throw new Error("Venda já está cancelada");
      }

      // Devolver estoque
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });

        // Registrar devolução
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: MovementType.IN,
            quantity: item.quantity,
            reason: `Cancelamento venda #${sale.id}`,
            userId,
          },
        });
      }

      // Atualizar status
      return await tx.sale.update({
        where: { id },
        data: { status: "CANCELLED" },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  },

  async getTotalRevenue() {
    const result = await prisma.sale.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: {
          not: "CANCELLED", // Ignora vendas canceladas
        },
      },
    });

    return {
      totalRevenue: Number(result._sum.total) || 0,
    };
  },

  async getStats() {
    const [totalResult, countResult] = await Promise.all([
      // Valor total
      prisma.sale.aggregate({
        _sum: {
          total: true,
        },
        where: {
          status: { not: "CANCELLED" },
        },
      }),
      // Quantidade de vendas
      prisma.sale.count({
        where: {
          status: { not: "CANCELLED" },
        },
      }),
    ]);

    const totalRevenue = Number(totalResult._sum.total) || 0;
    const totalSales = countResult;
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      totalRevenue,
      totalSales,
      averageTicket, // ← Ticket médio
    };
  },

  async getMonthlyRevenue(year?: number) {
    const currentYear = year || new Date().getFullYear();

    const sales = await prisma.sale.findMany({
      where: {
        status: { not: "CANCELLED" },
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lte: new Date(`${currentYear}-12-31`),
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    // Agrupar por mês
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
    }));

    sales.forEach((sale) => {
      const month = sale.createdAt.getMonth(); // 0-11
      monthlyData[month].revenue += Number(sale.total);
    });

    // Nomes dos meses
    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    return monthlyData.map((data, index) => ({
      month: monthNames[index],
      revenue: Math.round(data.revenue * 100) / 100, // Arredondar 2 casas
    }));
  },

  async getTodaySales() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalResult, countResult] = await Promise.all([
      prisma.sale.aggregate({
        _sum: {
          total: true,
        },
        where: {
          status: { not: "CANCELLED" },
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.sale.count({
        where: {
          status: { not: "CANCELLED" },
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
    ]);

    return {
      totalRevenue: Number(totalResult._sum.total) || 0,
      totalSales: countResult,
    };
  },

  async getPendingSales() {
    const [totalResult, countResult] = await Promise.all([
      prisma.sale.aggregate({
        _sum: {
          total: true,
        },
        where: {
          status: "PENDING",
        },
      }),
      prisma.sale.count({
        where: {
          status: "PENDING",
        },
      }),
    ]);

    return {
      totalPending: Number(totalResult._sum.total) || 0,
      count: countResult,
    };
  },
};
