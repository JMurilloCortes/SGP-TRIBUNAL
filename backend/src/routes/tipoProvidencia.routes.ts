import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { listar, crear, actualizar, toggleActivo, eliminar } from '../controllers/tipoProvidencia.controller'

const router = Router()
router.use(authenticate)

router.get('/', listar)
router.post('/', crear)
router.patch('/:id', actualizar)
router.patch('/:id/estado', toggleActivo)
router.delete('/:id', eliminar)

export default router
