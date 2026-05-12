import { prisma } from '../../utils/prisma'

export const categoriesService = {
  async allCategories(companyId: number) {
    return await prisma.category.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    })
  },

  async getCategoryById(id: number, companyId: number) {
    const category = await prisma.category.findFirst({
      where: { id, companyId },
    })

    if (!category) {
      throw new Error('Categoria não encontrada')
    }

    return category
  },

  async createCategory(name: string, companyId: number) {
    const categoryExists = await prisma.category.findFirst({
      where: { name, companyId },
    })

    if (categoryExists) {
      throw new Error('Categoria já cadastrada')
    }

    return await prisma.category.create({
      data: { name, companyId },
    })
  },

  async updateCategory(id: number, name: string, companyId: number) {
    const category = await prisma.category.findFirst({
      where: { id, companyId },
    })

    if (!category) {
      throw new Error('Categoria não encontrada')
    }

    const nameExists = await prisma.category.findFirst({
      where: { name, companyId, NOT: { id } },
    })

    if (nameExists) {
      throw new Error('Nome já está em uso')
    }

    return await prisma.category.update({
      where: { id },
      data: { name },
    })
  },

  async deleteCategory(id: number, companyId: number) {
    const category = await prisma.category.findFirst({
      where: { id, companyId },
      include: { products: true },
    })

    if (!category) {
      throw new Error('Categoria não encontrada')
    }

    if (category.products.length > 0) {
      throw new Error('Categoria possui produtos vinculados')
    }

    await prisma.category.delete({ where: { id } })

    return { message: 'Categoria deletada com sucesso' }
  },
}
