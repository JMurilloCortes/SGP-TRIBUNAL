import express from 'express'
import cors from 'cors'
import cron from 'node-cron'
import { env } from './config/env'
import authRoutes from './routes/auth.routes'
import catalogoRoutes from './routes/catalogo.routes'
import procesoRoutes from './routes/proceso.routes'
import providenciaRoutes from './routes/providencia.routes'
import dashboardRoutes from './routes/dashboard.routes'
import { verificarTerminosVencidos } from './controllers/providencia.controller'

const app = express()

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/catalogos', catalogoRoutes)
app.use('/api/procesos', procesoRoutes)
app.use('/api', providenciaRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Cron job: verificar términos vencidos cada hora
cron.schedule('0 * * * *', () => {
  verificarTerminosVencidos()
})

app.listen(env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${env.PORT}`)
})
