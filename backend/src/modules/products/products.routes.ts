import { Router } from 'express'
import { productsController } from './products.controller'
import { authMiddleware } from '../../middlewares/auth.middlewares'
import { authorize } from '../../middlewares/authorize'

const router = Router()

// Rotas públicas
router.get('/', productsController.list)
router.get('/low-stock', productsController.getLowStock)
router.get('/top-selling', productsController.topSelling)
router.get('/:id', productsController.getById)

// Rotas protegidas
router.post(
  '/',
  authMiddleware,
  authorize('ADMIN', 'SUPERVISOR', 'OPERATOR'),
  productsController.create,
)
router.put(
  '/:id',
  authMiddleware,
  authorize('ADMIN', 'SUPERVISOR', 'OPERATOR'),
  productsController.update,
)
router.delete('/:id', authMiddleware, authorize('ADMIN'), productsController.delete)

export default router
