import { prisma } from '../../utils/prisma'

export const dashboardService = {
  async getSummary(companyId: number) {
    const currentYear = new Date().getFullYear()

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const tomorrow = new Date(todayStart)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [
      salesAggregate,
      salesCount,
      stockAggregate,
      totalCustomers,
      todayAggregate,
      todayCount,
      pendingAggregate,
      pendingCount,
      lowStockCount,
      lowStockProducts,
      monthlySales,
      topSaleItems,
      topSaleGroups,
    ] = await Promise.all([
      prisma.sale.aggregate({
        _sum: { total: true },
        where: { companyId, status: { not: 'CANCELLED' } },
      }),
      prisma.sale.count({
        where: { companyId, status: { not: 'CANCELLED' } },
      }),
      prisma.product.aggregate({
        _sum: { stock: true },
        where: { companyId },
      }),
      prisma.customer.count({ where: { companyId } }),
      prisma.sale.aggregate({
        _sum: { total: true },
        where: { companyId, status: { not: 'CANCELLED' }, createdAt: { gte: todayStart, lt: tomorrow } },
      }),
      prisma.sale.count({
        where: { companyId, status: { not: 'CANCELLED' }, createdAt: { gte: todayStart, lt: tomorrow } },
      }),
      prisma.sale.aggregate({
        _sum: { total: true },
        where: { companyId, status: 'PENDING' },
      }),
      prisma.sale.count({ where: { companyId, status: 'PENDING' } }),
      prisma.product.count({ where: { companyId, stock: { lt: 10 } } }),
      prisma.product.findMany({
        where: { companyId, stock: { lt: 10 } },
        select: { id: true, name: true, stock: true, sku: true },
        orderBy: { stock: 'asc' },
        take: 5,
      }),
      prisma.sale.findMany({
        where: {
          companyId,
          status: { not: 'CANCELLED' },
          createdAt: {
            gte: new Date(`${currentYear}-01-01`),
            lt: new Date(`${currentYear + 1}-01-01`),
          },
        },
        select: { total: true, createdAt: true },
      }),
      prisma.saleItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        where: { sale: { companyId } },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
      prisma.sale.groupBy({
        by: ['customerId'],
        _sum: { total: true },
        _count: { id: true },
        where: { companyId, status: { not: 'CANCELLED' } },
        orderBy: { _sum: { total: 'desc' } },
        take: 10,
      }),
    ])

    const [topProductDetails, topCustomerDetails] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: topSaleItems.map((i) => i.productId) }, companyId },
        select: { id: true, name: true, price: true, stock: true },
      }),
      prisma.customer.findMany({
        where: { id: { in: topSaleGroups.map((i) => i.customerId) }, companyId },
        select: { id: true, name: true },
      }),
    ])

    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({ month: monthNames[i], revenue: 0 }))
    monthlySales.forEach((sale) => {
      monthlyData[sale.createdAt.getMonth()].revenue = Math.round((monthlyData[sale.createdAt.getMonth()].revenue + Number(sale.total)) * 100) / 100
    })

    const totalRevenue = Number(salesAggregate._sum.total) || 0
    const totalSales = salesCount
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0

    return {
      stats: {
        totalStockUnits: Number(stockAggregate._sum.stock) || 0,
        totalRevenue,
        totalSales,
        averageTicket,
        totalCustomers,
      },
      today: {
        totalRevenue: Number(todayAggregate._sum.total) || 0,
        totalSales: todayCount,
      },
      pending: {
        totalPending: Number(pendingAggregate._sum.total) || 0,
        count: pendingCount,
      },
      lowStock: {
        count: lowStockCount,
        products: lowStockProducts,
      },
      monthlyRevenue: monthlyData,
      topProducts: topSaleItems.map((item) => ({
        ...topProductDetails.find((p) => p.id === item.productId),
        totalSold: item._sum.quantity || 0,
      })),
      topCustomers: topSaleGroups.map((item) => ({
        ...topCustomerDetails.find((c) => c.id === item.customerId),
        totalSpent: Number(item._sum.total) || 0,
        totalPurchases: item._count.id,
      })),
    }
  },
}
