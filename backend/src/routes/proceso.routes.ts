import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { list, getById, create, update, cambiarEtapa } from '../controllers/proceso.controller'

const router = Router()
router.use(authenticate)

router.get('/', list)
router.get('/:id', getById)
router.post('/', create)
router.put('/:id', update)
router.patch('/:id/etapa', cambiarEtapa)

export default router
