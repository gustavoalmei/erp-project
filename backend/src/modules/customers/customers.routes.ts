import { Router, type Request, type Response, type NextFunction } from 'express'
import { customersController } from './customers.controller'
import { authMiddleware } from '../../middlewares/auth.middlewares'

const router = Router()

const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado' })
  }
  next()
}

// Todas as rotas de clientes são protegidas
router.use(authMiddleware)

router.get('/', adminOnly, customersController.list)
router.get('/top-customers', adminOnly, customersController.topCustomers)
router.get('/:id', adminOnly, customersController.getById)
router.post('/', adminOnly, customersController.create)
router.put('/:id', adminOnly, customersController.update)
router.delete('/:id', adminOnly, customersController.delete)

export default router
