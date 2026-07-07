import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { listarModelos, generarOficio } from '../controllers/oficio.controller'

const router = Router()
router.use(authenticate)

router.get('/modelos', listarModelos)
router.post('/:id/generar', generarOficio)

export default router
