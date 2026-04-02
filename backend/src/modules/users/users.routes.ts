import { Router, type Request, type Response, type NextFunction } from 'express'
import { usersController } from './users.controller'
import { authMiddleware } from '../../middlewares/auth.middlewares'

const router = Router()

const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado' })
  }
  next()
}

router.use(authMiddleware)

router.get('/me', usersController.getProfile)
router.put('/me', usersController.updateProfile)
router.patch('/me/password', usersController.changePassword)
router.get('/all', adminOnly, usersController.getAll)
router.put('/:id', adminOnly, usersController.updateUser)
router.delete('/:id', adminOnly, usersController.deleteUser)

export default router
