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
  const data = await prisma.juzgado.findMany({
    orderBy: { nombre: 'asc' },
    include: { _count: { select: { procesos: true } } },
  })
  return res.json(data)
}

export async function crear(req: AuthRequest, res: Response) {
  if (req.user?.rol !== 'ADMIN') return res.status(403).json({ error: 'Solo admin' })

  const data = createSchema.parse(req.body)

  const exists = await prisma.juzgado.findFirst({ where: { codigo: data.codigo } })
  if (exists) return res.status(400).json({ error: 'Ya existe un juzgado con ese código' })

  const juzgado = await prisma.juzgado.create({ data: { nombre: data.nombre, codigo: data.codigo } })
  return res.status(201).json(juzgado)
}

export async function actualizar(req: AuthRequest, res: Response) {
  if (req.user?.rol !== 'ADMIN') return res.status(403).json({ error: 'Solo admin' })

  const id = parseInt(req.params.id as string)
  const data = updateSchema.parse(req.body)

  const exists = await prisma.juzgado.findUnique({ where: { id } })
  if (!exists) return res.status(404).json({ error: 'Juzgado no encontrado' })

  if (data.codigo && data.codigo !== exists.codigo) {
    const dup = await prisma.juzgado.findFirst({ where: { codigo: data.codigo } })
    if (dup) return res.status(400).json({ error: 'Ya existe un juzgado con ese código' })
  }

  const juzgado = await prisma.juzgado.update({
    where: { id },
    data: {
      ...(data.nombre && { nombre: data.nombre }),
      ...(data.codigo && { codigo: data.codigo }),
    },
  })

  return res.json(juzgado)
}

export async function eliminar(req: AuthRequest, res: Response) {
  if (req.user?.rol !== 'ADMIN') return res.status(403).json({ error: 'Solo admin' })

  const id = parseInt(req.params.id as string)
  const juzgado = await prisma.juzgado.findUnique({
    where: { id },
    include: { _count: { select: { procesos: true } } },
  })
  if (!juzgado) return res.status(404).json({ error: 'Juzgado no encontrado' })

  if (juzgado._count.procesos > 0) {
    return res.status(400).json({ error: `No se puede eliminar: tiene ${juzgado._count.procesos} proceso(s) asociado(s)` })
  }

  await prisma.juzgado.delete({ where: { id } })
  return res.json({ message: 'Juzgado eliminado' })
}
