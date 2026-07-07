import { Request } from 'express'

export interface AuthPayload {
  userId: number
  email: string
  rol: string
  despachoId: number | null
}

export interface AuthRequest extends Request {
  user?: AuthPayload
}
