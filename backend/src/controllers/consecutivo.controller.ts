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

  // Si el filtro es TODOS, primero traer OCUPADOS y luego DISPONIBLES
  if (filtro === 'TODOS') {
    // Contar totales por estado
    const [totalOcupados, totalDisponibles] = await Promise.all([
      prisma.consecutivo.count({ where: { ...whereBase, estado: 'OCUPADO' } }),
      prisma.consecutivo.count({ where: { ...whereBase, estado: 'DISPONIBLE' } }),
    ])
    const total = totalOcupados + totalDisponibles

    // Primero traer OCUPADOS ordenados por número
    if (skip < totalOcupados) {
      // Aún hay ocupados por cargar
      const consecutivos = await prisma.consecutivo.findMany({
        where: { ...whereBase, estado: 'OCUPADO' },
        orderBy: { numero: 'asc' },
        skip,
        take,
        include: { tomadoUser: { select: { nombre: true } } },
      })
      return res.json({ consecutivos, total })
    } else {
      // Ya pasamos los ocupados, cargar disponibles
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
  }

  // Filtro por DISPONIBLE o OCUPADO
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
    const result = await prisma.$transaction(async (tx) => {
      // Atomic claim: solo actualiza si sigue en DISPONIBLE
      const claim = await tx.consecutivo.updateMany({
        where: { id: Number(id), estado: 'DISPONIBLE' },
        data: { estado: 'OCUPADO', tomadoPor: userId },
      })

      if (claim.count === 0) {
        const exists = await tx.consecutivo.findUnique({ where: { id: Number(id) } })
        if (!exists) throw new Error('No encontrado')
        throw new Error('Ya está ocupado')
      }

      // Validar orden secuencial
      const c = await tx.consecutivo.findUnique({
        where: { id: Number(id) },
      })
      if (!c) throw new Error('No encontrado')

      const numActual = parseInt(c.numero, 10)
      if (numActual > 1) {
        const anterior = String(numActual - 1).padStart(4, '0')
        const prev = await tx.consecutivo.findFirst({
          where: { numero: anterior, tipo: c.tipo, estado: 'DISPONIBLE' },
        })
        if (prev) {
          // Revertir la ocupación atómica
          await tx.consecutivo.update({
            where: { id: Number(id) },
            data: { estado: 'DISPONIBLE', tomadoPor: null },
          })
          throw new Error(`Debe tomar primero el número #${anterior}`)
        }
      }

      return tx.consecutivo.findUnique({
        where: { id: Number(id) },
        include: { tomadoUser: { select: { nombre: true } } },
      })
    })

    if (result) {
      getIO().emit('consecutivo:update', result)
      res.json(result)
    }
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
}

export async function liberar(req: Request, res: Response) {
  const { id } = req.params

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Atomic release: solo libera si sigue en OCUPADO
      const claim = await tx.consecutivo.updateMany({
        where: { id: Number(id), estado: 'OCUPADO' },
        data: { estado: 'DISPONIBLE', tomadoPor: null },
      })

      if (claim.count === 0) {
        const exists = await tx.consecutivo.findUnique({ where: { id: Number(id) } })
        if (!exists) throw new Error('No encontrado')
        throw new Error('No está ocupado')
      }

      return tx.consecutivo.findUnique({
        where: { id: Number(id) },
        include: { tomadoUser: { select: { nombre: true } } },
      })
    })

    if (result) {
      getIO().emit('consecutivo:update', result)
      res.json(result)
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
