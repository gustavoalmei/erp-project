import { prisma } from "../../utils/prisma";

export const productsService = {
  async allProducts() {
    return await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getProductById(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new Error("Produto não encontrado");
    }

    return product;
  },

  async createProduct(
    name: string,
    description: string | undefined,
    price: number,
    stock: number,
    sku: string,
    categoryId: number,
  ) {
    const skuExists = await prisma.product.findUnique({
      where: { sku },
    });

    if (skuExists) {
      throw new Error("SKU já cadastrado");
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      throw new Error("Categoria não encontrada");
    }

    return await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        sku,
        categoryId,
      },
      include: { category: true },
    });
  },

  async updateProduct(
    id: number,
    name: string,
    description: string | undefined,
    price: number,
    stock: number,
    sku: string,
    categoryId: number,
  ) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error("Produto não encontrado");
    }

    if (sku !== product.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku },
      });

      if (skuExists) {
        throw new Error("SKU já está em uso");
      }
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      throw new Error("Categoria não encontrada");
    }

    return await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        stock,
        sku,
        categoryId,
      },
      include: { category: true },
    });
  },

  async deleteProduct(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { saleItems: true },
    });

    if (!product) {
      throw new Error("Produto não encontrado");
    }

    if (product.saleItems.length > 0) {
      throw new Error("Produto possui vendas vinculadas");
    }

    await prisma.product.delete({
      where: { id },
    });

    return { message: "Produto deletado com sucesso" };
  },
};
