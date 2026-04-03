import { prisma } from '../../utils/prisma'

export const logsService = {
  async create(message: string, userId?: number) {
    await prisma.activityLog.create({
      data: {
        message,
        userId: userId ?? null,
      },
    })
  },

  async getAll() {
    return prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })
  },
  async getByUserId(userId: number) {
    return prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })
  },
}
