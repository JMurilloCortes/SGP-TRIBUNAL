import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { list, marcarLeida, marcarTodasLeidas } from '../controllers/notificacion.controller'

const router = Router()
router.use(authenticate)

router.get('/', list)
router.patch('/:id/leer', marcarLeida)
router.post('/leer-todas', marcarTodasLeidas)

export default router
