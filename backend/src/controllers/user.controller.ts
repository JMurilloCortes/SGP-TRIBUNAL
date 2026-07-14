import { Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../config/database'
import { AuthRequest } from '../types'
import { z } from 'zod'

const allRoles = ['ADMIN', 'ESCRIBIENTE', 'NOTIFICADOR', 'CONTADOR_LIQUIDADOR', 'PROFESIONAL', 'SECRETARIO', 'OFICIAL_MAYOR'] as const

const createUserSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  rol: z.enum(allRoles),
  cargo: z.string().optional(),
  activo: z.boolean().default(true),
  despachoIds: z.array(z.number().int().positive()).optional(),
  juzgadoIds: z.array(z.number().int().positive()).optional(),
})

const updateUserSchema = z.object({
  nombre: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  rol: z.enum(allRoles).optional(),
  cargo: z.string().optional(),
  activo: z.boolean().optional(),
})

const userSelect = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  cargo: true,
  activo: true,
  createdAt: true,
  despachos: {
    include: { despacho: { select: { id: true, nombre: true, codigo: true } } },
  },
  juzgados: {
    include: { juzgado: { select: { id: true, nombre: true, codigo: true } } },
  },
} as const

function formatUser(u: any) {
  return {
    ...u,
    despachos: u.despachos.map((d: any) => d.despacho),
    juzgados: u.juzgados.map((j: any) => j.juzgado),
  }
}

export async function list(_req: AuthRequest, res: Response) {
  const users = await prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: 'desc' },
  })
  return res.json(users.map(formatUser))
}

export async function getById(req: AuthRequest, res: Response) {
  const id = parseInt(req.params.id as string)
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect })
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })
  return res.json(formatUser(user))
}

export async function create(req: AuthRequest, res: Response) {
  const data = createUserSchema.parse(req.body)

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) return res.status(400).json({ message: 'Ya existe un usuario con ese email' })

  const passwordHash = await bcrypt.hash(data.password, 10)

  const user = await prisma.user.create({
    data: {
      nombre: data.nombre,
      email: data.email,
      passwordHash,
      rol: data.rol,
      cargo: data.cargo || null,
      activo: data.activo,
      despachos: data.despachoIds
        ? { create: data.despachoIds.map(id => ({ despachoId: id })) }
        : undefined,
      juzgados: data.juzgadoIds
        ? { create: data.juzgadoIds.map(id => ({ juzgadoId: id })) }
        : undefined,
    },
    select: userSelect,
  })

  return res.status(201).json(formatUser(user))
}

export async function update(req: AuthRequest, res: Response) {
  const id = parseInt(req.params.id as string)
  const data = updateUserSchema.parse(req.body)

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

  const updateData: any = {}
  if (data.nombre !== undefined) updateData.nombre = data.nombre
  if (data.email !== undefined) updateData.email = data.email
  if (data.password !== undefined) updateData.passwordHash = await bcrypt.hash(data.password, 10)
  if (data.rol !== undefined) updateData.rol = data.rol
  if (data.cargo !== undefined) updateData.cargo = data.cargo || null
  if (data.activo !== undefined) updateData.activo = data.activo

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: userSelect,
  })

  return res.json(formatUser(updated))
}

export async function updateDespachos(req: AuthRequest, res: Response) {
  const id = parseInt(req.params.id as string)
  const { despachoIds } = z.object({
    despachoIds: z.array(z.number().int().positive()),
  }).parse(req.body)

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

  await prisma.userDespacho.deleteMany({ where: { userId: id } })
  if (despachoIds.length > 0) {
    await prisma.userDespacho.createMany({
      data: despachoIds.map(despachoId => ({ userId: id, despachoId })),
    })
  }

  const updated = await prisma.user.findUnique({ where: { id }, select: userSelect })
  return res.json(formatUser(updated!))
}

export async function updateJuzgados(req: AuthRequest, res: Response) {
  const id = parseInt(req.params.id as string)
  const { juzgadoIds } = z.object({
    juzgadoIds: z.array(z.number().int().positive()),
  }).parse(req.body)

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

  await prisma.userJuzgado.deleteMany({ where: { userId: id } })
  if (juzgadoIds.length > 0) {
    await prisma.userJuzgado.createMany({
      data: juzgadoIds.map(juzgadoId => ({ userId: id, juzgadoId })),
    })
  }

  const updated = await prisma.user.findUnique({ where: { id }, select: userSelect })
  return res.json(formatUser(updated!))
}

export async function toggleEstado(req: AuthRequest, res: Response) {
  const id = parseInt(req.params.id as string)

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })
  if (user.rol === 'ADMIN') return res.status(400).json({ message: 'No se puede cambiar el estado de un administrador' })

  const updated = await prisma.user.update({
    where: { id },
    data: { activo: !user.activo },
    select: userSelect,
  })

  return res.json(formatUser(updated))
}

export async function remove(req: AuthRequest, res: Response) {
  const id = parseInt(req.params.id as string)

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })
  if (user.rol === 'ADMIN') return res.status(400).json({ message: 'No se puede eliminar un administrador' })

  await prisma.notificacion.deleteMany({ where: { userId: id } })
  await prisma.actuacion.deleteMany({ where: { userId: id } })
  await prisma.userDespacho.deleteMany({ where: { userId: id } })
  await prisma.userJuzgado.deleteMany({ where: { userId: id } })
  await prisma.user.delete({ where: { id } })

  return res.json({ message: 'Usuario eliminado permanentemente' })
}
