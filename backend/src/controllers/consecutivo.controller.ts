import { Request, Response } from 'express'
import { prisma } from '../config/database'
import { getIO } from '../config/socket'
import { AuthRequest } from '../types'

const TIPOS = ['OFICIO', 'CIRCULAR', 'CITACION', 'RESOLUCION'] as const

export async function proximoDisponible(req: AuthRequest, res: Response) {
  const tipo = (String(req.query.tipo || 'OFICIO').toUpperCase())
  const consecutivo = await prisma.consecutivo.findFirst({
    where: { tipo: tipo as any, estado: 'DISPONIBLE' },
    orderBy: { id: 'asc' },
  })
  if (!consecutivo) {
    return res.status(404).json({ message: `No hay consecutivos ${tipo} disponibles` })
  }
  res.json(consecutivo)
}

export async function listar(req: Request, res: Response) {
  const tipo = (String(req.query.tipo || 'OFICIO').toUpperCase())
  const tipoValido = TIPOS.includes(tipo as any) ? tipo : 'OFICIO'
  const consecutivos = await prisma.consecutivo.findMany({
    where: { tipo: tipoValido as any },
    orderBy: { id: 'asc' },
    include: { tomadoUser: { select: { nombre: true } } },
  })
  res.json(consecutivos)
}

export async function ocupar(req: Request, res: Response) {
  const { id } = req.params
  const userId = (req as any).user?.userId
  if (!userId) return res.status(401).json({ error: 'No autenticado' })

  try {
    const result = await prisma.$transaction(async (tx) => {
      const c = await tx.consecutivo.findUnique({ where: { id: Number(id) } })
      if (!c) throw new Error('No encontrado')
      if (c.estado !== 'DISPONIBLE') throw new Error('Ya está ocupado')

      // Validar orden: no permitir si el número anterior está disponible
      const numActual = parseInt(c.numero, 10)
      if (numActual > 1) {
        const anterior = String(numActual - 1).padStart(4, '0')
        const prev = await tx.consecutivo.findFirst({
          where: { numero: anterior, tipo: c.tipo, estado: 'DISPONIBLE' },
        })
        if (prev) throw new Error(`Debe tomar primero el número #${anterior}`)
      }

      return tx.consecutivo.update({
        where: { id: Number(id) },
        data: { estado: 'OCUPADO', tomadoPor: userId },
        include: { tomadoUser: { select: { nombre: true } } },
      })
    })

    getIO().emit('consecutivo:update', result)
    res.json(result)
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
}

export async function liberar(req: Request, res: Response) {
  const { id } = req.params

  try {
    const result = await prisma.$transaction(async (tx) => {
      const c = await tx.consecutivo.findUnique({ where: { id: Number(id) } })
      if (!c) throw new Error('No encontrado')
      if (c.estado !== 'OCUPADO') throw new Error('No está ocupado')

      return tx.consecutivo.update({
        where: { id: Number(id) },
        data: { estado: 'DISPONIBLE', tomadoPor: null },
        include: { tomadoUser: { select: { nombre: true } } },
      })
    })

    getIO().emit('consecutivo:update', result)
    res.json(result)
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
}

export async function resetAll(req: AuthRequest, res: Response) {
  if (req.user?.rol !== 'ADMIN') return res.status(403).json({ error: 'Solo admin' })

  await prisma.consecutivo.updateMany({
    data: { estado: 'DISPONIBLE', tomadoPor: null },
  })

  getIO().emit('consecutivo:reset')
  res.json({ ok: true })
}
