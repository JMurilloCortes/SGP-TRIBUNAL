import { Server as SocketServer } from 'socket.io'
import jwt from 'jsonwebtoken'
import { env } from './env'

let io: SocketServer

export function initSocket(httpServer: any) {
  io = new SocketServer(httpServer, {
    cors: { origin: env.FRONTEND_URL, credentials: true },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('No autenticado'))
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any
      ;(socket as any).user = decoded
      next()
    } catch {
      next(new Error('Token inválido'))
    }
  })

  return io
}

export function getIO() {
  return io
}
