import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export function connectSocket(token: string) {
  if (socket?.connected) return socket
  socket = io(BACKEND_URL, {
    auth: { token },
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  })
  socket.on('connect_error', () => {})  // silence transport fallback errors
  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}

export function getSocket() {
  return socket
}
