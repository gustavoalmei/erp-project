import { Router, type Request, type Response, type NextFunction } from 'express'
import { productsController } from './products.controller'
import { authMiddleware } from '../../middlewares/auth.middlewares'

const router = Router()

const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado' })
  }
  next()
}

// Rotas públicas
router.get('/', productsController.list)
router.get('/low-stock', productsController.getLowStock)
router.get('/top-selling', productsController.topSelling)
router.get('/:id', productsController.getById)

// Rotas protegidas
router.post('/', authMiddleware, adminOnly, productsController.create)
router.put('/:id', authMiddleware, adminOnly, productsController.update)
router.delete('/:id', authMiddleware, adminOnly, productsController.delete)

export default router
