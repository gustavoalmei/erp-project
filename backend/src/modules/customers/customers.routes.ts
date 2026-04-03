import { Router } from 'express'
import { customersController } from './customers.controller'
import { authMiddleware } from '../../middlewares/auth.middlewares'
import { authorize } from '../../middlewares/authorize'

const router = Router()

router.use(authMiddleware)

// Visualização: todos os autenticados
router.get('/', authorize('ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR', 'VIEWER'), customersController.list)
router.get('/top-customers', authorize('ADMIN', 'MANAGER', 'VIEWER'), customersController.topCustomers)
router.get('/:id', authorize('ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR', 'VIEWER'), customersController.getById)

// Cadastro e edição: ADMIN, SUPERVISOR, OPERATOR
router.post('/', authorize('ADMIN', 'SUPERVISOR', 'OPERATOR'), customersController.create)
router.put('/:id', authorize('ADMIN', 'SUPERVISOR', 'OPERATOR'), customersController.update)

// Exclusão: apenas ADMIN
router.delete('/:id', authorize('ADMIN'), customersController.delete)

export default router
