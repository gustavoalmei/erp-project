import { prisma } from '../../utils/prisma'
import { type Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { authConfig } from '../../config/auth'

export const usersService = {
  async getProfile(userId: number, companyId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        companies: {
          where: { companyId },
          select: { role: true },
        },
      },
    })
    if (!user) throw { code: 404, message: 'Usuário não encontrado' }

    const role = user.companies[0]?.role ?? null
    return { id: user.id, name: user.name, email: user.email, role, avatar: user.avatar }
  },

  async updateProfile(userId: number, name: string, email: string, avatar: string) {
    const emailTaken = await prisma.user.findFirst({
      where: { email, NOT: { id: userId } },
    })
    if (emailTaken) throw { code: 409, message: 'Email já está em uso' }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email, avatar },
    })
    return { id: user.id, name: user.name, email: user.email, avatar: user.avatar }
  },

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw { code: 404, message: 'Usuário não encontrado' }

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) throw { code: 422, message: 'Senha atual incorreta' }

    const hashed = await bcrypt.hash(newPassword, authConfig.bcrypt.saltRounds)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    })
  },

  async getAll(companyId: number) {
    const userCompanies = await prisma.userCompany.findMany({
      where: { companyId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    })

    return userCompanies.map((uc) => ({
      ...uc.user,
      role: uc.role,
    }))
  },

  async updateUser(userId: number, name: string, email: string, role: string, companyId: number) {
    const emailTaken = await prisma.user.findFirst({
      where: { email, NOT: { id: userId } },
    })
    if (emailTaken) throw { code: 409, message: 'Email já está em uso' }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    })

    await prisma.userCompany.update({
      where: { userId_companyId: { userId, companyId } },
      data: { role: role as Role },
    })

    const userCompany = await prisma.userCompany.findUnique({
      where: { userId_companyId: { userId, companyId } },
    })

    return { id: user.id, name: user.name, email: user.email, role: userCompany?.role ?? null }
  },

  async deleteUser(userId: number, companyId: number) {
    const userCompany = await prisma.userCompany.findUnique({
      where: { userId_companyId: { userId, companyId } },
    })
    if (!userCompany) throw { code: 404, message: 'Usuário não encontrado' }

    await prisma.userCompany.delete({
      where: { userId_companyId: { userId, companyId } },
    })
  },
}
