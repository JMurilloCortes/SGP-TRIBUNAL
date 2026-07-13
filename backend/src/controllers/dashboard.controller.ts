import { Response } from 'express'
import { prisma } from '../config/database'
import { AuthRequest } from '../types'

export async function stats(req: AuthRequest, res: Response) {
  const where = req.user?.rol !== 'ADMIN' && req.despachoIds && req.despachoIds.length > 0
    ? { despachoActualId: { in: req.despachoIds } }
    : {}

  const [total, activos, vencidos, porVencer, archivados, proximos] = await Promise.all([
    prisma.proceso.count({ where }),
    prisma.proceso.count({ where: { ...where, vigente: true, colorEstado: { not: 'GRIS' } } }),
    prisma.proceso.count({ where: { ...where, colorEstado: 'ROJO' } }),
    prisma.proceso.count({ where: { ...where, colorEstado: { in: ['AMARILLO', 'NARANJA'] } } }),
    prisma.proceso.count({ where: { ...where, colorEstado: 'GRIS' } }),
    prisma.proceso.findMany({
      where: {
        ...where,
        vigente: true,
        terminos: {
          some: {
            estado: 'PENDIENTE',
            fechaVencimiento: {
              gte: new Date(),
              lte: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            },
          },
        },
      },
      include: {
        claseProceso: true,
        etapaActual: true,
        despachoActual: true,
        terminos: {
          where: { estado: 'PENDIENTE' },
          orderBy: { fechaVencimiento: 'asc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
  ])

  return res.json({
    total,
    activos,
    vencidos,
    porVencer,
    archivados,
    proximos,
  })
}
