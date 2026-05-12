import { Router } from 'express'
import { dashboardController } from './dashboard.controller'
import { authMiddleware } from '../../middlewares/auth.middlewares'

const router = Router()

router.use(authMiddleware)

router.get('/', dashboardController.show)

export default router
