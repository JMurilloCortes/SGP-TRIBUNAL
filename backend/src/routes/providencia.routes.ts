import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth'
import { list, create, listPendientes, notificar, remove, cumplirTermino } from '../controllers/providencia.controller'

const router = Router()
router.use(authenticate)

router.get('/procesos/:id/providencias', list)
router.post('/procesos/:id/providencias', create)
router.get('/providencias/pendientes', authorize('NOTIFICADOR', 'ADMIN'), listPendientes)
router.patch('/providencias/:id/notificar', authorize('NOTIFICADOR', 'ADMIN'), notificar)
router.delete('/providencias/:id', remove)
router.patch('/terminos/:id/cumplir', cumplirTermino)

export default router
