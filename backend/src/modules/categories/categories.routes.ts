import { Router, type Request, type Response, type NextFunction } from 'express'
import { categoriesController } from './categories.controller'
import { authMiddleware } from '../../middlewares/auth.middlewares'

const router = Router()

const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado' })
  }
  next()
}

// Rotas públicas
router.get('/', categoriesController.list)
router.get('/:id', categoriesController.getById)

// Rotas protegidas
router.post('/', authMiddleware, adminOnly, categoriesController.create)
router.put('/:id', authMiddleware, adminOnly, categoriesController.update)
router.delete('/:id', authMiddleware, adminOnly, categoriesController.delete)

export default router
