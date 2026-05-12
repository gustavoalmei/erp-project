import { type Request, type Response } from 'express'
import { authService } from './auth.service'
import { logsService } from '../logs/logs.service'

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email inválido' })
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{12,}$/
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          error: 'Senha deve ter no mínimo 12 caracteres, uma maiúscula, um número e um símbolo.',
        })
      }

      const user = await authService.register(name, email, password)

      await logsService.create(`Novo usuário registrado: ${email}`, user.id)

      return res.status(201).json({ message: 'Usuário criado com sucesso', user })
    } catch (error) {
      const err = error as Error
      if (err.message === 'Email já cadastrado') {
        return res.status(409).json({ error: err.message })
      }
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async verify(_req: Request, res: Response) {
    return res.status(200).json({ valid: true })
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' })
      }

      if (typeof password !== 'string') {
        return res.status(400).json({ error: 'Senha deve ser uma string' })
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email inválido' })
      }

      const result = await authService.login(email, password)

      await logsService.create(`Login realizado: ${email}`, result.user.id)

      return res.status(200).json(result)
    } catch (error) {
      const err = error as Error
      if (err.message === 'Credenciais inválidas') {
        return res.status(401).json({ error: err.message })
      }
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async getMyCompanies(req: Request, res: Response) {
    try {
      const companies = await authService.getMyCompanies(req.userId!)
      return res.status(200).json(companies)
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async createCompany(req: Request, res: Response) {
    try {
      const { name } = req.body

      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ error: 'Nome da empresa é obrigatório (mínimo 2 caracteres)' })
      }

      const result = await authService.createCompany(req.userId!, name.trim())

      await logsService.create(`Empresa criada: ${name.trim()}`, req.userId)

      return res.status(201).json(result)
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async selectCompany(req: Request, res: Response) {
    try {
      const { companyId } = req.body

      if (!companyId || isNaN(Number(companyId))) {
        return res.status(400).json({ error: 'companyId é obrigatório' })
      }

      const result = await authService.selectCompany(req.userId!, Number(companyId))

      await logsService.create(
        `Empresa selecionada: #${companyId}`,
        req.userId,
        Number(companyId),
      )

      return res.status(200).json(result)
    } catch (error) {
      const err = error as Error
      if (err.message === 'Empresa não encontrada ou sem permissão') {
        return res.status(403).json({ error: err.message })
      }
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async logout(req: Request, res: Response) {
    try {
      await logsService.create('Logout realizado', req.userId, req.companyId)

      return res.status(200).json({ message: 'Logout realizado com sucesso' })
    } catch (error) {
      const err = error as Error
      return res.status(500).json({ error: err.message })
    }
  },
}
