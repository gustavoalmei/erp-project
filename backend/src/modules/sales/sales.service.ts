import { prisma } from '../../utils/prisma'
import { MovementType } from '@prisma/client'
import type { SaleStatus } from '@prisma/client'

interface CreateSaleItem {
  productId: number
  quantity: number
}

export const salesService = {
  async createSale(customerId: number, items: CreateSaleItem[], userId: number, companyId: number) {
    return await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id: customerId, companyId },
      })

      if (!customer) {
        throw new Error('Cliente não encontrado')
      }

      let totalSale = 0
      const saleItemsData = []

      for (const item of items) {
        const product = await tx.product.findFirst({
          where: { id: item.productId, companyId },
        })

        if (!product) {
          throw new Error(`Produto ${item.productId} não encontrado`)
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}, Solicitado: ${item.quantity}`,
          )
        }

        const subtotal = Number(product.price) * item.quantity
        totalSale += subtotal

        saleItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal,
        })
      }

      const sale = await tx.sale.create({
        data: { customerId, userId, companyId, total: totalSale, status: 'PENDING' },
      })

      for (const itemData of saleItemsData) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: itemData.productId,
            quantity: itemData.quantity,
            unitPrice: itemData.unitPrice,
            subtotal: itemData.subtotal,
          },
        })

        await tx.product.update({
          where: { id: itemData.productId },
          data: { stock: { decrement: itemData.quantity } },
        })

        await tx.stockMovement.create({
          data: {
            productId: itemData.productId,
            type: MovementType.OUT,
            quantity: itemData.quantity,
            reason: `Venda #${sale.id}`,
            userId,
          },
        })
      }

      return await tx.sale.findUnique({
        where: { id: sale.id },
        include: {
          customer: { select: { id: true, name: true, email: true } },
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, price: true, sku: true } },
            },
          },
        },
      })
    })
  },

  async listSales(companyId: number) {
    return await prisma.sale.findMany({
      where: { companyId },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        user: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, price: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async getSaleById(id: number, companyId: number) {
    const sale = await prisma.sale.findFirst({
      where: { id, companyId },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, price: true, sku: true } },
          },
        },
      },
    })

    if (!sale) {
      throw new Error('Venda não encontrada')
    }

    return sale
  },

  async updateSaleStatus(id: number, status: string, companyId: number) {
    const validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED']

    if (!validStatuses.includes(status)) {
      throw new Error('Status inválido. Use: PENDING, COMPLETED ou CANCELLED')
    }

    const sale = await prisma.sale.findFirst({ where: { id, companyId } })

    if (!sale) {
      throw new Error('Venda não encontrada')
    }

    return await prisma.sale.update({
      where: { id },
      data: { status: status as SaleStatus },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    })
  },

  async cancelSale(id: number, userId: number, companyId: number) {
    return await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findFirst({
        where: { id, companyId },
        include: { items: true },
      })

      if (!sale) {
        throw new Error('Venda não encontrada')
      }

      if (sale.status === 'CANCELLED') {
        throw new Error('Venda já está cancelada')
      }

      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: MovementType.IN,
            quantity: item.quantity,
            reason: `Cancelamento venda #${sale.id}`,
            userId,
          },
        })
      }

      return await tx.sale.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      })
    })
  },

  async getTotalRevenue(companyId: number) {
    const result = await prisma.sale.aggregate({
      _sum: { total: true },
      where: { companyId, status: { not: 'CANCELLED' } },
    })

    return { totalRevenue: Number(result._sum.total) || 0 }
  },

  async getStats(companyId: number) {
    const [totalResult, countResult] = await Promise.all([
      prisma.sale.aggregate({
        _sum: { total: true },
        where: { companyId, status: { not: 'CANCELLED' } },
      }),
      prisma.sale.count({
        where: { companyId, status: { not: 'CANCELLED' } },
      }),
    ])

    const totalRevenue = Number(totalResult._sum.total) || 0
    const totalSales = countResult
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0

    return { totalRevenue, totalSales, averageTicket }
  },

  async getMonthlyRevenue(companyId: number, year?: number) {
    const currentYear = year || new Date().getFullYear()

    const sales = await prisma.sale.findMany({
      where: {
        companyId,
        status: { not: 'CANCELLED' },
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
      select: { total: true, createdAt: true },
    })

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
    }))

    sales.forEach((sale) => {
      const month = sale.createdAt.getMonth()
      monthlyData[month].revenue += Number(sale.total)
    })

    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

    return monthlyData.map((data, index) => ({
      month: monthNames[index],
      revenue: Math.round(data.revenue * 100) / 100,
    }))
  },

  async getTodaySales(companyId: number) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [totalResult, countResult] = await Promise.all([
      prisma.sale.aggregate({
        _sum: { total: true },
        where: {
          companyId,
          status: { not: 'CANCELLED' },
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
      prisma.sale.count({
        where: {
          companyId,
          status: { not: 'CANCELLED' },
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
    ])

    return {
      totalRevenue: Number(totalResult._sum.total) || 0,
      totalSales: countResult,
    }
  },

  async getPendingSales(companyId: number) {
    const [totalResult, countResult] = await Promise.all([
      prisma.sale.aggregate({
        _sum: { total: true },
        where: { companyId, status: 'PENDING' },
      }),
      prisma.sale.count({
        where: { companyId, status: 'PENDING' },
      }),
    ])

    return {
      totalPending: Number(totalResult._sum.total) || 0,
      count: countResult,
    }
  },
}
