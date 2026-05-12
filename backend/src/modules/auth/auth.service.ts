import { prisma } from '../../utils/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { authConfig } from '../../config/auth'

export const authService = {
  async register(name: string, email: string, password: string) {
    const userExists = await prisma.user.findUnique({ where: { email } })

    if (userExists) {
      throw new Error('Email já cadastrado')
    }

    const hashedPassword = await bcrypt.hash(password, authConfig.bcrypt.saltRounds)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    })

    return { id: user.id, name: user.name, email: user.email }
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        companies: {
          include: { company: true },
        },
      },
    })

    if (!user) {
      throw new Error('Credenciais inválidas')
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      throw new Error('Credenciais inválidas')
    }

    // Token sem companyId — apenas para identificar o usuário na seleção de empresa
    const token = jwt.sign(
      { userId: user.id, companyId: null, role: null },
      authConfig.jwt.secret,
      { expiresIn: authConfig.jwt.expiresIn, algorithm: 'HS256' },
    )

    const companies = user.companies.map((uc) => ({
      id: uc.company.id,
      name: uc.company.name,
      role: uc.role,
    }))

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
      },
      companies,
    }
  },

  async getMyCompanies(userId: number) {
    const userCompanies = await prisma.userCompany.findMany({
      where: { userId },
      include: { company: true },
    })
    return userCompanies.map((uc) => ({
      id: uc.company.id,
      name: uc.company.name,
      role: uc.role,
    }))
  },

  async createCompany(userId: number, name: string) {
    const company = await prisma.company.create({ data: { name } })
    await prisma.userCompany.create({
      data: { userId, companyId: company.id, role: 'ADMIN' },
    })
    return { id: company.id, name: company.name, role: 'ADMIN' as const }
  },

  async selectCompany(userId: number, companyId: number) {
    const userCompany = await prisma.userCompany.findUnique({
      where: { userId_companyId: { userId, companyId } },
      include: { user: true },
    })

    if (!userCompany) {
      throw new Error('Empresa não encontrada ou sem permissão')
    }

    const { user } = userCompany

    const token = jwt.sign(
      { userId, companyId, role: userCompany.role },
      authConfig.jwt.secret,
      { expiresIn: authConfig.jwt.expiresIn, algorithm: 'HS256' },
    )

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userCompany.role,
        companyId,
        isSuperAdmin: user.isSuperAdmin,
      },
    }
  },
}
