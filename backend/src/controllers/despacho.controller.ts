import { Response } from 'express'
import { prisma } from '../config/database'
import { AuthRequest } from '../types'
import { z } from 'zod'

const createSchema = z.object({
  nombre: z.string().min(1),
  codigo: z.string().min(1),
})

const updateSchema = z.object({
  nombre: z.string().min(1).optional(),
  codigo: z.string().min(1).optional(),
})

export async function listar(_req: AuthRequest, res: Response) {
  const data = await prisma.despacho.findMany({
    orderBy: { nombre: 'asc' },
    include: { _count: { select: { procesos: true, usuarios: true } } },
  })
  return res.json(data)
}

export async function crear(req: AuthRequest, res: Response) {
  if (req.user?.rol !== 'ADMIN') return res.status(403).json({ error: 'Solo admin' })

  const data = createSchema.parse(req.body)

  const exists = await prisma.despacho.findFirst({ where: { codigo: data.codigo } })
  if (exists) return res.status(400).json({ error: 'Ya existe un despacho con ese código' })

  const despacho = await prisma.despacho.create({ data: { nombre: data.nombre, codigo: data.codigo } })
  return res.status(201).json(despacho)
}

export async function actualizar(req: AuthRequest, res: Response) {
  if (req.user?.rol !== 'ADMIN') return res.status(403).json({ error: 'Solo admin' })

  const id = parseInt(req.params.id as string)
  const data = updateSchema.parse(req.body)

  const exists = await prisma.despacho.findUnique({ where: { id } })
  if (!exists) return res.status(404).json({ error: 'Despacho no encontrado' })

  if (data.codigo && data.codigo !== exists.codigo) {
    const dup = await prisma.despacho.findFirst({ where: { codigo: data.codigo } })
    if (dup) return res.status(400).json({ error: 'Ya existe un despacho con ese código' })
  }

  const despacho = await prisma.despacho.update({
    where: { id },
    data: {
      ...(data.nombre && { nombre: data.nombre }),
      ...(data.codigo && { codigo: data.codigo }),
    },
  })

  return res.json(despacho)
}

export async function eliminar(req: AuthRequest, res: Response) {
  if (req.user?.rol !== 'ADMIN') return res.status(403).json({ error: 'Solo admin' })

  const id = parseInt(req.params.id as string)
  const despacho = await prisma.despacho.findUnique({
    where: { id },
    include: { _count: { select: { procesos: true, usuarios: true } } },
  })
  if (!despacho) return res.status(404).json({ error: 'Despacho no encontrado' })

  if (despacho._count.procesos > 0) {
    return res.status(400).json({ error: `No se puede eliminar: tiene ${despacho._count.procesos} proceso(s) asociado(s)` })
  }

  await prisma.userDespacho.deleteMany({ where: { despachoId: id } })
  await prisma.despacho.delete({ where: { id } })
  return res.json({ message: 'Despacho eliminado' })
}
