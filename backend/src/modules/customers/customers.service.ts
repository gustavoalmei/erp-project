import { prisma } from '../../utils/prisma'

export const customersService = {
  async allCustomers() {
    const customers = await prisma.customer.findMany({
      orderBy: { name: 'asc' },
      select: {
        address: true,
        document: true,
        email: true,
        id: true,
        name: true,
        phone: true,
      },
    })

    return customers.map((customer) => {
      let document
      if (customer.document.length === 11) {
        document = customer.document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4')
      } else if (customer.document.length === 14) {
        document = customer.document.replace(
          /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
          '$1.***.***/$4-$5',
        )
      } else {
        document = customer.document
      }
      return {
        ...customer,
        document,
      }
    })
  },

  async getCustomerById(id: number) {
    const customer = await prisma.customer.findUnique({
      where: { id },
    })

    if (!customer) {
      throw new Error('Cliente não encontrado')
    }
    return customer
  },

  async createCustomer(
    name: string,
    email: string,
    phone: string,
    document: string,
    address?: string,
  ) {
    const emailExists = await prisma.customer.findUnique({
      where: { email },
    })

    if (emailExists) {
      throw new Error('Email já cadastrado')
    }

    const documentExists = await prisma.customer.findUnique({
      where: { document },
    })

    if (documentExists) {
      throw new Error('Documento já cadastrado')
    }

    return await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        document,
        address,
      },
    })
  },

  async updateCustomer(
    id: number,
    name: string,
    email: string,
    phone: string,
    document: string,
    address?: string,
  ) {
    const customer = await prisma.customer.findUnique({
      where: { id },
    })

    if (!customer) {
      throw new Error('Cliente não encontrado')
    }

    if (email !== customer.email) {
      const emailExists = await prisma.customer.findUnique({
        where: { email },
      })

      if (emailExists) {
        throw new Error('Email já está em uso')
      }
    }

    if (document !== customer.document) {
      const documentExists = await prisma.customer.findUnique({
        where: { document },
      })

      if (documentExists) {
        throw new Error('Documento já está em uso')
      }
    }

    return await prisma.customer.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        document,
        address,
      },
    })
  },

  async deleteCustomer(id: number) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { sales: true },
    })

    if (!customer) {
      throw new Error('Cliente não encontrado')
    }

    if (customer.sales.length > 0) {
      throw new Error('Cliente possui vendas vinculadas')
    }

    await prisma.customer.delete({
      where: { id },
    })

    return { message: 'Cliente deletado com sucesso' }
  },

  async topCustomers(limit: number = 10) {
    // Buscar vendas agrupadas por cliente
    const topCustomers = await prisma.sale.groupBy({
      by: ['customerId'],
      _sum: {
        total: true, // ← Soma o valor total gasto
      },
      _count: {
        id: true, // ← Conta quantas compras fez
      },
      where: {
        status: {
          not: 'CANCELLED', // ← Ignora vendas canceladas
        },
      },
      orderBy: {
        _sum: {
          total: 'desc', // ← Ordena por quem gastou mais
        },
      },
      take: limit,
    })

    // Buscar detalhes dos clientes
    const customerIds = topCustomers.map((item) => item.customerId)

    const customers = await prisma.customer.findMany({
      where: {
        id: { in: customerIds },
      },
      select: {
        id: true,
        name: true,
      },
    })

    // Combinar dados
    return topCustomers.map((item) => {
      const customer = customers.find((c) => c.id === item.customerId)
      return {
        ...customer,
        totalSpent: Number(item._sum.total) || 0, // Total gasto
        totalPurchases: item._count.id, // Quantidade de compras
      }
    })
  },
}
