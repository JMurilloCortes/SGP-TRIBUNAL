import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth'
import { list, getById, create, update, updateDespachos, remove } from '../controllers/user.controller'

const router = Router()
router.use(authenticate)
router.use(authorize('ADMIN'))

router.get('/', list)
router.get('/:id', getById)
router.post('/', create)
router.put('/:id', update)
router.patch('/:id/despachos', updateDespachos)
router.delete('/:id', remove)

export default router
