import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { getDespachos, getClasesProceso, getEtapas, getTiposProvidencia, getJuzgados } from '../controllers/catalogo.controller'

const router = Router()
router.use(authenticate)

router.get('/despachos', getDespachos)
router.get('/clases-proceso', getClasesProceso)
router.get('/etapas', getEtapas)
router.get('/tipos-providencia', getTiposProvidencia)
router.get('/juzgados', getJuzgados)

export default router
