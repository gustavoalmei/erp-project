import { Router } from 'express'
import { salesController } from './sales.controller'
import { authMiddleware } from '../../middlewares/auth.middlewares'
import { authorize } from '../../middlewares/authorize'

const router = Router()

router.use(authMiddleware)

// Listagem e visualização: todos os autenticados exceto VIEWER em detalhes operacionais
router.get(
  '/',
  authorize('ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR', 'VIEWER'),
  salesController.list,
)
router.get('/total', authorize('ADMIN', 'MANAGER', 'VIEWER'), salesController.getTotalRevenue)
router.get('/stats', authorize('ADMIN', 'MANAGER', 'VIEWER'), salesController.getStats)
router.get(
  '/pending',
  authorize('ADMIN', 'SUPERVISOR', 'OPERATOR', 'VIEWER'),
  salesController.getPendingSales,
)
router.get(
  '/today',
  authorize('ADMIN', 'SUPERVISOR', 'OPERATOR', 'VIEWER'),
  salesController.getTodaySales,
)
router.get(
  '/monthly-revenue',
  authorize('ADMIN', 'MANAGER', 'VIEWER'),
  salesController.getMonthlyRevenue,
)
router.get(
  '/:id',
  authorize('ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR', 'VIEWER'),
  salesController.getById,
)

// Operacionais: ADMIN, SUPERVISOR, OPERATOR
router.post('/', authorize('ADMIN', 'SUPERVISOR', 'OPERATOR'), salesController.create)

// Aprovação / mudança de status: ADMIN, MANAGER, SUPERVISOR
router.patch(
  '/:id/status',
  authorize('ADMIN', 'MANAGER', 'SUPERVISOR'),
  salesController.updateStatus,
)

// Cancelamento: ADMIN
router.delete('/:id', authorize('ADMIN'), salesController.cancel)

export default router
