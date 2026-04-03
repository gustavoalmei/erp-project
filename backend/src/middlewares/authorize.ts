import { type Request, type Response, type NextFunction } from 'express'

export type Role = 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'OPERATOR' | 'VIEWER'

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole as Role)) {
      return res.status(403).json({ error: 'Acesso negado' })
    }
    next()
  }
}
