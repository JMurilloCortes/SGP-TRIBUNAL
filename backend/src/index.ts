import http from 'http'
import express from 'express'
import cors from 'cors'
import cron from 'node-cron'
import { env } from './config/env'
import { initSocket } from './config/socket'
import authRoutes from './routes/auth.routes'
import catalogoRoutes from './routes/catalogo.routes'
import procesoRoutes from './routes/proceso.routes'
import providenciaRoutes from './routes/providencia.routes'
import dashboardRoutes from './routes/dashboard.routes'
import notificacionRoutes from './routes/notificacion.routes'
import userRoutes from './routes/user.routes'
import oficioRoutes from './routes/oficio.routes'
import consecutivoRoutes from './routes/consecutivo.routes'
import { verificarTerminosVencidos } from './controllers/providencia.controller'
import { generarAlertasTerminos } from './controllers/notificacion.controller'

const app = express()
const server = http.createServer(app)

initSocket(server)

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/catalogos', catalogoRoutes)
app.use('/api/procesos', procesoRoutes)
app.use('/api', providenciaRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/notificaciones', notificacionRoutes)
app.use('/api/users', userRoutes)
app.use('/api/oficios', oficioRoutes)
app.use('/api/consecutivos', consecutivoRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Cron job: verificar términos vencidos y generar alertas cada hora
cron.schedule('0 * * * *', async () => {
  const vencidos = await verificarTerminosVencidos()
  const alertas = await generarAlertasTerminos()
  console.log(`[Cron] Términos vencidos: ${vencidos}, Alertas generadas: ${JSON.stringify(alertas)}`)
})

server.listen(env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${env.PORT}`)
})
