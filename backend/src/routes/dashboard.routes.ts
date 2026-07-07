import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { stats } from '../controllers/dashboard.controller'

const router = Router()
router.use(authenticate)

router.get('/stats', stats)

export default router
