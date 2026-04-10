import { Router } from 'express'
import { settingsController } from './settings.controller'
import { authMiddleware } from '../../middlewares/auth.middlewares'
import { authorize } from '../../middlewares/authorize'

const router = Router()

router.use(authMiddleware)

// Leitura: todos os autenticados
router.get('/', settingsController.getSettings)
router.get('/logo', settingsController.getLogo)

// Escrita: apenas ADMIN
router.put('/', authorize('ADMIN'), settingsController.updateSettings)
router.post('/logo', authorize('ADMIN'), settingsController.updateLogo)
router.delete('/logo', authorize('ADMIN'), settingsController.deleteLogo)

export default router
