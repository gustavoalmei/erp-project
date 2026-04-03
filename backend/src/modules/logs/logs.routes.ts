import { Router } from 'express'
import { logsController } from './logs.controller'
import { authMiddleware } from '../../middlewares/auth.middlewares'
import { authorize } from '../../middlewares/authorize'

const router = Router()

router.get('/', authMiddleware, authorize('ADMIN', 'MANAGER'), logsController.getAll)
router.get('/user/:id', authMiddleware, authorize('ADMIN', 'MANAGER'), logsController.getByUserId)
export default router
