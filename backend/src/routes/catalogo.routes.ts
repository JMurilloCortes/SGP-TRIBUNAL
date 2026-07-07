import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { getDespachos, getClasesProceso, getEtapas, getTiposProvidencia } from '../controllers/catalogo.controller'

const router = Router()
router.use(authenticate)

router.get('/despachos', getDespachos)
router.get('/clases-proceso', getClasesProceso)
router.get('/etapas', getEtapas)
router.get('/tipos-providencia', getTiposProvidencia)

export default router
