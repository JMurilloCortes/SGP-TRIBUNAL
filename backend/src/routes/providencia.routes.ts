import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { list, create, remove, cumplirTermino } from '../controllers/providencia.controller'

const router = Router()
router.use(authenticate)

router.get('/procesos/:id/providencias', list)
router.post('/procesos/:id/providencias', create)
router.delete('/providencias/:id', remove)
router.patch('/terminos/:id/cumplir', cumplirTermino)

export default router
