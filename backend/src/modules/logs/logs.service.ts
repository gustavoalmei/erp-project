import { prisma } from '../../utils/prisma'

export const logsService = {
  async create(message: string, userId?: number, companyId?: number) {
    await prisma.activityLog.create({
      data: {
        message,
        userId: userId ?? null,
        companyId: companyId ?? null,
      },
    })
  },

  async getAll(companyId: number) {
    return prisma.activityLog.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })
  },

  async getByUserId(userId: number, companyId: number) {
    return prisma.activityLog.findMany({
      where: { userId, companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })
  },
}
