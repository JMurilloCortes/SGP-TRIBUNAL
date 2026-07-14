import { Response } from 'express'
import { prisma } from '../config/database'
import { AuthRequest } from '../types'
import { z } from 'zod'

const createSchema = z.object({
  nombre: z.string().min(1),
  diasTermino: z.number().int().min(1),
  ordenPredeterminada: z.string().optional(),
})

const updateSchema = z.object({
  nombre: z.string().min(1).optional(),
  diasTermino: z.number().int().min(1).optional(),
  ordenPredeterminada: z.string().optional(),
})

export async function listar(_req: AuthRequest, res: Response) {
  const data = await prisma.tipoProvidencia.findMany({
    orderBy: { nombre: 'asc' },
    include: { _count: { select: { providencias: true } } },
  })
  return res.json(data)
}

export async function crear(req: AuthRequest, res: Response) {
  if (req.user?.rol !== 'ADMIN') return res.status(403).json({ error: 'Solo admin' })

  const data = createSchema.parse(req.body)

  const exists = await prisma.tipoProvidencia.findFirst({ where: { nombre: data.nombre } })
  if (exists) return res.status(400).json({ error: 'Ya existe un tipo de providencia con ese nombre' })

  const tipo = await prisma.tipoProvidencia.create({
    data: {
      nombre: data.nombre,
      diasTermino: data.diasTermino,
      ordenPredeterminada: (data.ordenPredeterminada as any) || 'OTRO',
    },
  })

  return res.status(201).json(tipo)
}

export async function actualizar(req: AuthRequest, res: Response) {
  if (req.user?.rol !== 'ADMIN') return res.status(403).json({ error: 'Solo admin' })

  const id = parseInt(req.params.id as string)
  const data = updateSchema.parse(req.body)

  const exists = await prisma.tipoProvidencia.findUnique({ where: { id } })
  if (!exists) return res.status(404).json({ error: 'Tipo de providencia no encontrado' })

  if (data.nombre && data.nombre !== exists.nombre) {
    const dup = await prisma.tipoProvidencia.findFirst({ where: { nombre: data.nombre } })
    if (dup) return res.status(400).json({ error: 'Ya existe un tipo de providencia con ese nombre' })
  }

  const tipo = await prisma.tipoProvidencia.update({
    where: { id },
    data: {
      ...(data.nombre && { nombre: data.nombre }),
      ...(data.diasTermino && { diasTermino: data.diasTermino }),
      ...(data.ordenPredeterminada && { ordenPredeterminada: data.ordenPredeterminada as any }),
    },
  })

  return res.json(tipo)
}

export async function toggleActivo(req: AuthRequest, res: Response) {
  if (req.user?.rol !== 'ADMIN') return res.status(403).json({ error: 'Solo admin' })

  const id = parseInt(req.params.id as string)
  const tipo = await prisma.tipoProvidencia.findUnique({ where: { id } })
  if (!tipo) return res.status(404).json({ error: 'Tipo de providencia no encontrado' })

  const updated = await prisma.tipoProvidencia.update({
    where: { id },
    data: { activo: !tipo.activo },
  })

  return res.json(updated)
}

export async function eliminar(req: AuthRequest, res: Response) {
  if (req.user?.rol !== 'ADMIN') return res.status(403).json({ error: 'Solo admin' })

  const id = parseInt(req.params.id as string)
  const tipo = await prisma.tipoProvidencia.findUnique({
    where: { id },
    include: { _count: { select: { providencias: true } } },
  })
  if (!tipo) return res.status(404).json({ error: 'Tipo de providencia no encontrado' })

  if (tipo._count.providencias > 0) {
    return res.status(400).json({ error: `No se puede eliminar: tiene ${tipo._count.providencias} providencia(s) asociada(s). Puede inactivarlo en su lugar.` })
  }

  await prisma.tipoProvidencia.delete({ where: { id } })
  return res.json({ message: 'Tipo de providencia eliminado' })
}
