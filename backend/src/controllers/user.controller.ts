import { Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../config/database'
import { AuthRequest } from '../types'
import { z } from 'zod'

const createUserSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  rol: z.enum(['ADMIN', 'ESCRIBIENTE']),
  activo: z.boolean().default(true),
  despachoIds: z.array(z.number().int().positive()).optional(),
})

const updateUserSchema = z.object({
  nombre: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  rol: z.enum(['ADMIN', 'ESCRIBIENTE']).optional(),
  activo: z.boolean().optional(),
})

export async function list(_req: AuthRequest, res: Response) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      activo: true,
      createdAt: true,
      despachos: {
        include: { despacho: { select: { id: true, nombre: true, codigo: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return res.json(users.map(u => ({
    ...u,
    despachos: u.despachos.map(d => d.despacho),
  })))
}

export async function getById(req: AuthRequest, res: Response) {
  const id = parseInt(req.params.id as string)
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      activo: true,
      createdAt: true,
      despachos: {
        include: { despacho: { select: { id: true, nombre: true, codigo: true } } },
      },
    },
  })
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

  return res.json({
    ...user,
    despachos: user.despachos.map(d => d.despacho),
  })
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
      activo: data.activo,
      despachos: data.despachoIds
        ? { create: data.despachoIds.map(id => ({ despachoId: id })) }
        : undefined,
    },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      activo: true,
      createdAt: true,
      despachos: {
        include: { despacho: { select: { id: true, nombre: true, codigo: true } } },
      },
    },
  })

  return res.status(201).json({
    ...user,
    despachos: user.despachos.map(d => d.despacho),
  })
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
  if (data.activo !== undefined) updateData.activo = data.activo

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      activo: true,
      createdAt: true,
      despachos: {
        include: { despacho: { select: { id: true, nombre: true, codigo: true } } },
      },
    },
  })

  return res.json({
    ...updated,
    despachos: updated.despachos.map(d => d.despacho),
  })
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

  const updated = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      activo: true,
      despachos: {
        include: { despacho: { select: { id: true, nombre: true, codigo: true } } },
      },
    },
  })

  return res.json({
    ...updated,
    despachos: updated!.despachos.map(d => d.despacho),
  })
}

export async function toggleEstado(req: AuthRequest, res: Response) {
  const id = parseInt(req.params.id as string)

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })
  if (user.rol === 'ADMIN') return res.status(400).json({ message: 'No se puede cambiar el estado de un administrador' })

  const updated = await prisma.user.update({
    where: { id },
    data: { activo: !user.activo },
    select: {
      id: true, nombre: true, email: true, rol: true, activo: true, createdAt: true,
      despachos: {
        include: { despacho: { select: { id: true, nombre: true, codigo: true } } },
      },
    },
  })

  return res.json({
    ...updated,
    despachos: updated.despachos.map(d => d.despacho),
  })
}

export async function remove(req: AuthRequest, res: Response) {
  const id = parseInt(req.params.id as string)

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })
  if (user.rol === 'ADMIN') return res.status(400).json({ message: 'No se puede eliminar un administrador' })

  // Eliminar registros relacionados
  await prisma.notificacion.deleteMany({ where: { userId: id } })
  await prisma.actuacion.deleteMany({ where: { userId: id } })
  await prisma.userDespacho.deleteMany({ where: { userId: id } })
  await prisma.user.delete({ where: { id } })

  return res.json({ message: 'Usuario eliminado permanentemente' })
}
