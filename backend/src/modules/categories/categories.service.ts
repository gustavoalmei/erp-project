import { prisma } from '../../utils/prisma'

export const categoriesService = {
  async allCategories() {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
    })
  },

  async getCategoryById(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
    })

    if (!category) {
      throw new Error('Categoria não encontrada')
    }

    return category
  },

  async createCategory(name: string) {
    const categoryExists = await prisma.category.findUnique({
      where: { name },
    })

    if (categoryExists) {
      throw new Error('Categoria já cadastrada')
    }

    return await prisma.category.create({
      data: { name },
    })
  },

  async updateCategory(id: number, name: string) {
    const category = await prisma.category.findUnique({
      where: { id },
    })

    if (!category) {
      throw new Error('Categoria não encontrada')
    }

    const nameExists = await prisma.category.findFirst({
      where: {
        name,
        NOT: { id },
      },
    })

    if (nameExists) {
      throw new Error('Nome já está em uso')
    }

    return await prisma.category.update({
      where: { id },
      data: { name },
    })
  },

  async deleteCategory(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { products: true },
    })

    if (!category) {
      throw new Error('Categoria não encontrada')
    }

    if (category.products.length > 0) {
      throw new Error('Categoria possui produtos vinculados')
    }

    await prisma.category.delete({
      where: { id },
    })

    return { message: 'Categoria deletada com sucesso' }
  },
}
