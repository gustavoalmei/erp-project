import { Router } from 'express'
import { authController } from './auth.controller'
import { authMiddleware } from '../../middlewares/auth.middlewares'

const router = Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/my-companies', authMiddleware, authController.getMyCompanies)
router.post('/create-company', authMiddleware, authController.createCompany)
router.post('/select-company', authMiddleware, authController.selectCompany)
router.get('/verify', authMiddleware, authController.verify)
router.post('/logout', authMiddleware, authController.logout)

export default router
