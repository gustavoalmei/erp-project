import { Router } from 'express'
import { usersController } from './users.controller'
import { authMiddleware } from '../../middlewares/auth.middlewares'
import { authorize } from '../../middlewares/authorize'

const router = Router()

router.use(authMiddleware)

// Perfil próprio: qualquer autenticado
router.get('/me', usersController.getProfile)
router.put('/me', usersController.updateProfile)
router.patch('/me/password', usersController.changePassword)

// Gestão de usuários: apenas ADMIN
router.get('/all', authorize('ADMIN'), usersController.getAll)
router.put('/:id', authorize('ADMIN'), usersController.updateUser)
router.delete('/:id', authorize('ADMIN'), usersController.deleteUser)

export default router
