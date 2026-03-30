import { Router } from 'express'
import { categoriesController } from './categories.controller'
import { authMiddleware } from '../../middlewares/auth.middlewares'

const router = Router()

// Rotas públicas
router.get('/', categoriesController.list)
router.get('/:id', categoriesController.getById)

// Rotas protegidas
router.post('/', authMiddleware, categoriesController.create)
router.put('/:id', authMiddleware, categoriesController.update)
router.delete('/:id', authMiddleware, categoriesController.delete)

export default router
