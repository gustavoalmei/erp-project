import { Router, type Request, type Response, type NextFunction } from 'express'
import { salesController } from './sales.controller'
import { authMiddleware } from '../../middlewares/auth.middlewares'

const router = Router()

const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado' })
  }
  next()
}

// Todas as rotas protegidas
router.use(authMiddleware)

router.get('/', adminOnly, salesController.list)
router.get('/total', adminOnly, salesController.getTotalRevenue)
router.get('/stats', adminOnly, salesController.getStats)
router.get('/pending', adminOnly, salesController.getPendingSales)
router.get('/today', adminOnly, salesController.getTodaySales)
router.get('/monthly-revenue', adminOnly, salesController.getMonthlyRevenue)
router.get('/:id', adminOnly, salesController.getById)
router.post('/', adminOnly, salesController.create)
router.patch('/:id/status', adminOnly, salesController.updateStatus)
router.delete('/:id', adminOnly, salesController.cancel)

export default router
