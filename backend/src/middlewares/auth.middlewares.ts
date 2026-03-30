import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { authConfig } from '../config/auth'

// Estender o tipo Request
declare global {
  namespace Express {
    interface Request {
      userId?: number
      userRole?: string
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
    const decoded = jwt.verify(token, authConfig.jwt.secret) as {
      userId: number
      role: string
    }

    req.userId = decoded.userId
    req.userRole = decoded.role

    return next()
  } catch (err) {
    return res.status(401).json({ error: err ?? 'Token inválido ou expirado' })
  }
}
