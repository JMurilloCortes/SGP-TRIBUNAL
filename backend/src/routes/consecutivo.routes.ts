import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth'
import { listar, ocupar, liberar, resetAll } from '../controllers/consecutivo.controller'

const router = Router()

router.use(authenticate)

router.get('/', listar)
router.patch('/:id/ocupar', ocupar)
router.patch('/:id/liberar', liberar)
router.post('/reset', authorize('ADMIN'), resetAll)

export default router
