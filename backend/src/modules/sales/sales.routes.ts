import { Router } from 'express'
import { salesController } from './sales.controller'
import { authMiddleware } from '../../middlewares/auth.middlewares'

const router = Router()

// Todas as rotas protegidas
router.use(authMiddleware)

router.get('/', salesController.list)
router.get('/total', salesController.getTotalRevenue)
router.get('/stats', salesController.getStats)
router.get('/pending', salesController.getPendingSales)
router.get('/today', salesController.getTodaySales)
router.get('/monthly-revenue', salesController.getMonthlyRevenue)
router.get('/:id', salesController.getById)
router.post('/', salesController.create)
router.patch('/:id/status', salesController.updateStatus)
router.delete('/:id', salesController.cancel)

export default router
