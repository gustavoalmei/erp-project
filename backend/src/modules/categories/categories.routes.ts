import { Router } from 'express'
import { categoriesController } from './categories.controller'
import { authMiddleware } from '../../middlewares/auth.middlewares'
import { authorize } from '../../middlewares/authorize'

const router = Router()

// Rotas públicas
router.get('/', categoriesController.list)
router.get('/:id', categoriesController.getById)

// Rotas protegidas
router.post('/', authMiddleware, authorize('ADMIN', 'SUPERVISOR', 'OPERATOR'), categoriesController.create)
router.put('/:id', authMiddleware, authorize('ADMIN', 'SUPERVISOR', 'OPERATOR'), categoriesController.update)
router.delete('/:id', authMiddleware, authorize('ADMIN'), categoriesController.delete)

export default router
