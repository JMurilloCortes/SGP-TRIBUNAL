import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { listar, ocupar, liberar } from '../controllers/consecutivo.controller'

const router = Router()

router.use(authenticate)

router.get('/', listar)
router.patch('/:id/ocupar', ocupar)
router.patch('/:id/liberar', liberar)

export default router
