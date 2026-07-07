import { Request } from 'express'

export interface AuthPayload {
  userId: number
  email: string
  rol: string
}

export interface AuthRequest extends Request {
  user?: AuthPayload
  despachoIds?: number[]
}
