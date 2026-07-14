import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { listar, crear, actualizar, eliminar } from '../controllers/juzgado.controller'

const router = Router()
router.use(authenticate)

router.get('/', listar)
router.post('/', crear)
router.patch('/:id', actualizar)
router.delete('/:id', eliminar)

export default router
