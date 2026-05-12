import { Router } from 'express'
import { categoriesController } from './categories.controller'
import { authMiddleware } from '../../middlewares/auth.middlewares'
import { authorize } from '../../middlewares/authorize'

const router = Router()

router.use(authMiddleware)

router.get('/', authorize('ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR', 'VIEWER'), categoriesController.list)
router.get('/:id', authorize('ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR', 'VIEWER'), categoriesController.getById)

router.post('/', authorize('ADMIN', 'SUPERVISOR', 'OPERATOR'), categoriesController.create)
router.put('/:id', authorize('ADMIN', 'SUPERVISOR', 'OPERATOR'), categoriesController.update)
router.delete('/:id', authorize('ADMIN'), categoriesController.delete)

export default router
