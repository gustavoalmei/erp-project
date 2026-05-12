import { Router } from 'express'
import { productsController } from './products.controller'
import { authMiddleware } from '../../middlewares/auth.middlewares'
import { authorize } from '../../middlewares/authorize'

const router = Router()

router.use(authMiddleware)

router.get('/', authorize('ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR', 'VIEWER'), productsController.list)
router.get('/low-stock', authorize('ADMIN', 'MANAGER', 'SUPERVISOR', 'VIEWER'), productsController.getLowStock)
router.get('/top-selling', authorize('ADMIN', 'MANAGER', 'VIEWER'), productsController.topSelling)
router.get('/:id', authorize('ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR', 'VIEWER'), productsController.getById)

router.post('/', authorize('ADMIN', 'SUPERVISOR', 'OPERATOR'), productsController.create)
router.put('/:id', authorize('ADMIN', 'SUPERVISOR', 'OPERATOR'), productsController.update)
router.delete('/:id', authorize('ADMIN'), productsController.delete)

export default router
