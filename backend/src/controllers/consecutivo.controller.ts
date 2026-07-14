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

export async function contarDisponibles(req: Request, res: Response) {
  const tipo = (String(req.query.tipo || 'OFICIO').toUpperCase())
  const tipoValido = TIPOS.includes(tipo as any) ? tipo : 'OFICIO'
  const count = await prisma.consecutivo.count({
    where: { tipo: tipoValido as any, estado: 'DISPONIBLE' },
  })
  res.json({ tipo: tipoValido, disponibles: count })
}

export async function listar(req: Request, res: Response) {
  const tipo = (String(req.query.tipo || 'OFICIO').toUpperCase())
  const tipoValido = TIPOS.includes(tipo as any) ? tipo : 'OFICIO'
  const skip = Math.max(0, parseInt(String(req.query.skip || '0'), 10) || 0)
  const take = Math.min(500, Math.max(1, parseInt(String(req.query.take || '100'), 10) || 100))
  const filtro = String(req.query.filtro || 'TODOS').toUpperCase()

  const whereBase: any = { tipo: tipoValido as any }

  if (filtro === 'TODOS') {
    const totalOcupados = await prisma.consecutivo.count({ where: { ...whereBase, estado: 'OCUPADO' } })
    const totalDisponibles = await prisma.consecutivo.count({ where: { ...whereBase, estado: 'DISPONIBLE' } })
    const total = totalOcupados + totalDisponibles

    if (skip < totalOcupados) {
      const consecutivos = await prisma.consecutivo.findMany({
        where: { ...whereBase, estado: 'OCUPADO' },
        orderBy: { numero: 'asc' },
        skip,
        take,
        include: { tomadoUser: { select: { nombre: true } } },
      })
      return res.json({ consecutivos, total })
    }

    const dispSkip = skip - totalOcupados
    const consecutivos = await prisma.consecutivo.findMany({
      where: { ...whereBase, estado: 'DISPONIBLE' },
      orderBy: { numero: 'asc' },
      skip: dispSkip,
      take,
      include: { tomadoUser: { select: { nombre: true } } },
    })
    return res.json({ consecutivos, total })
  }

  const where = { ...whereBase, estado: filtro as any }
  const total = await prisma.consecutivo.count({ where })
  const consecutivos = await prisma.consecutivo.findMany({
    where,
    orderBy: { numero: 'asc' },
    skip,
    take,
    include: { tomadoUser: { select: { nombre: true } } },
  })

  res.json({ consecutivos, total })
}

export async function ocupar(req: Request, res: Response) {
  const { id } = req.params
  const userId = (req as any).user?.userId
  if (!userId) return res.status(401).json({ error: 'No autenticado' })

  try {
    const numId = Number(id)

    const claim = await prisma.consecutivo.updateMany({
      where: { id: numId, estado: 'DISPONIBLE' },
      data: { estado: 'OCUPADO', tomadoPor: userId },
    })

    if (claim.count === 0) {
      const exists = await prisma.consecutivo.findUnique({ where: { id: numId } })
      if (!exists) return res.status(404).json({ error: 'No encontrado' })
      return res.status(400).json({ error: 'Ya está ocupado' })
    }

    const c = await prisma.consecutivo.findUnique({
      where: { id: numId },
      include: { tomadoUser: { select: { nombre: true } } },
    })
    if (!c) return res.status(404).json({ error: 'No encontrado' })

    const numActual = parseInt(c.numero, 10)
    if (numActual > 1) {
      const anterior = String(numActual - 1).padStart(4, '0')
      const prev = await prisma.consecutivo.findFirst({
        where: { numero: anterior, tipo: c.tipo, estado: 'DISPONIBLE' },
      })
      if (prev) {
        await prisma.consecutivo.update({
          where: { id: numId },
          data: { estado: 'DISPONIBLE', tomadoPor: null },
        })
        return res.status(400).json({ error: `Debe tomar primero el número #${anterior}` })
      }
    }

    res.json(c)
    getIO().emit('consecutivo:update', c)
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
}

export async function liberar(req: Request, res: Response) {
  const { id } = req.params

  try {
    const claim = await prisma.consecutivo.updateMany({
      where: { id: Number(id), estado: 'OCUPADO' },
      data: { estado: 'DISPONIBLE', tomadoPor: null },
    })

    if (claim.count === 0) {
      const exists = await prisma.consecutivo.findUnique({ where: { id: Number(id) } })
      if (!exists) return res.status(404).json({ error: 'No encontrado' })
      return res.status(400).json({ error: 'No está ocupado' })
    }

    const result = await prisma.consecutivo.findUnique({
      where: { id: Number(id) },
      include: { tomadoUser: { select: { nombre: true } } },
    })

    if (result) {
      res.json(result)
      getIO().emit('consecutivo:update', result)
    }
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
