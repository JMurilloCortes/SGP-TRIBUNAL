import http from 'http'
import express from 'express'
import cors from 'cors'
import cron from 'node-cron'
import { env } from './config/env'
import { prisma } from './config/database'
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
import tipoProvidenciaRoutes from './routes/tipoProvidencia.routes'
import despachoRoutes from './routes/despacho.routes'
import juzgadoRoutes from './routes/juzgado.routes'
import { verificarTerminosVencidos } from './controllers/providencia.controller'
import { generarAlertasTerminos } from './controllers/notificacion.controller'

const app = express()
const server = http.createServer(app)

initSocket(server)

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o: string) => o.trim())

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
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
app.use('/api/tipos-providencia', tipoProvidenciaRoutes)
app.use('/api/despachos', despachoRoutes)
app.use('/api/juzgados', juzgadoRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Cron job: verificar términos vencidos y generar alertas cada hora
cron.schedule('0 * * * *', async () => {
  try {
    const vencidos = await verificarTerminosVencidos()
    const alertas = await generarAlertasTerminos()
    console.log(`[Cron] Términos vencidos: ${vencidos}, Alertas generadas: ${JSON.stringify(alertas)}`)
  } catch (error) {
    console.error('[Cron] Error:', error)
  }
})

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('[Error] Promesa no manejada:', error)
})

process.on('uncaughtException', (error) => {
  console.error('[Error] Excepción no capturada:', error)
  prisma.$disconnect().then(() => process.exit(1))
})

// Apagado graceful
const shutdown = async () => {
  console.log('[Shutdown] Cerrando servidor...')
  await prisma.$disconnect()
  server.close(() => process.exit(0))
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

server.listen(env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${env.PORT}`)
})
