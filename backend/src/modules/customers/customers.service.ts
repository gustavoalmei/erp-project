import { prisma } from "../../utils/prisma";

export const customersService = {
  async allCustomers() {
    return await prisma.customer.findMany({
      orderBy: { name: "asc" },
    });
  },

  async getCustomerById(id: number) {
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new Error("Cliente não encontrado");
    }

    return customer;
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
    });

    if (emailExists) {
      throw new Error("Email já cadastrado");
    }

    const documentExists = await prisma.customer.findUnique({
      where: { document },
    });

    if (documentExists) {
      throw new Error("Documento já cadastrado");
    }

    return await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        document,
        address,
      },
    });
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
    });

    if (!customer) {
      throw new Error("Cliente não encontrado");
    }

    if (email !== customer.email) {
      const emailExists = await prisma.customer.findUnique({
        where: { email },
      });

      if (emailExists) {
        throw new Error("Email já está em uso");
      }
    }

    if (document !== customer.document) {
      const documentExists = await prisma.customer.findUnique({
        where: { document },
      });

      if (documentExists) {
        throw new Error("Documento já está em uso");
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
    });
  },

  async deleteCustomer(id: number) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { sales: true },
    });

    if (!customer) {
      throw new Error("Cliente não encontrado");
    }

    if (customer.sales.length > 0) {
      throw new Error("Cliente possui vendas vinculadas");
    }

    await prisma.customer.delete({
      where: { id },
    });

    return { message: "Cliente deletado com sucesso" };
  },
};
