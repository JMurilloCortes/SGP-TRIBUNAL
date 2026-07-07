import { Request, Response } from 'express'
import { prisma } from '../config/database'
import { getIO } from '../config/socket'

export async function listar(req: Request, res: Response) {
  const consecutivos = await prisma.consecutivo.findMany({
    orderBy: { id: 'asc' },
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

      return tx.consecutivo.update({
        where: { id: Number(id) },
        data: { estado: 'OCUPADO', tomadoPor: userId },
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
      })
    })

    getIO().emit('consecutivo:update', result)
    res.json(result)
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
}
