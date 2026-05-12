import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { authConfig } from '../config/auth'

declare global {
  namespace Express {
    interface Request {
      userId?: number
      userRole?: string
      companyId?: number
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const parts = authHeader.split(' ')

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token malformatado' })
  }

  const [scheme, token] = parts

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token malformatado' })
  }

  try {
    const decoded = jwt.verify(token, authConfig.jwt.secret, { algorithms: ['HS256'] }) as {
      userId: number
      role: string
      companyId: number | null
    }

    req.userId = decoded.userId
    req.userRole = decoded.role
    req.companyId = decoded.companyId ?? undefined

    return next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}
