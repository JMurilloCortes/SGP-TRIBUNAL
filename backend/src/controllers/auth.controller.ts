import { Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/database'
import { env } from '../config/env'
import { AuthRequest } from '../types'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const registerSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  rol: z.enum(['ADMIN', 'ESCRIBIENTE']).default('ESCRIBIENTE'),
  despachoId: z.number().int().positive().nullable().optional(),
})

export async function login(req: AuthRequest, res: Response) {
  const { email, password } = loginSchema.parse(req.body)

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.activo) {
    return res.status(401).json({ message: 'Credenciales inválidas' })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ message: 'Credenciales inválidas' })
  }

  const payload = {
    userId: user.id,
    email: user.email,
    rol: user.rol,
    despachoId: user.despachoId,
  }

  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  })

  return res.json({
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      despachoId: user.despachoId,
    },
  })
}

export async function register(req: AuthRequest, res: Response) {
  const data = registerSchema.parse(req.body)
  const passwordHash = await bcrypt.hash(data.password, 10)

  const user = await prisma.user.create({
    data: {
      nombre: data.nombre,
      email: data.email,
      passwordHash,
      rol: data.rol,
      despachoId: data.despachoId ?? null,
    },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      despachoId: true,
      activo: true,
    },
  })

  return res.status(201).json(user)
}

export async function me(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      despachoId: true,
      activo: true,
      despacho: true,
    },
  })
  return res.json(user)
}
