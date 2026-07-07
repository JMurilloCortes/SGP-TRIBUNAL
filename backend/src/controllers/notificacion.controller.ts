import { Response } from 'express'
import { prisma } from '../config/database'
import { AuthRequest } from '../types'
import { TipoNotificacion } from '@prisma/client'

export async function list(req: AuthRequest, res: Response) {
  const { soloNoLeidas } = req.query
  const userId = req.user!.userId
  const rol = req.user!.rol
  const despachoIds = req.despachoIds || []

  const where: any = {
    OR: [
      { userId },
      { userId: null },
    ],
  }
  if (soloNoLeidas === 'true') where.leida = false

  // Escribientes solo ven notificaciones de procesos en sus despachos
  if (rol === 'ESCRIBIENTE' && despachoIds.length > 0) {
    where.proceso = { despachoActualId: { in: despachoIds } }
  }

  const data = await prisma.notificacion.findMany({
    where,
    include: {
      proceso: {
        select: {
          id: true,
          radicado: true,
          colorEstado: true,
          despachoActualId: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const noLeidas = await prisma.notificacion.count({
    where: {
      ...where,
      ...(rol === 'ESCRIBIENTE' && despachoIds.length > 0
        ? { proceso: { despachoActualId: { in: despachoIds } } }
        : {}),
      leida: false,
    },
  })

  return res.json({ data, noLeidas })
}

export async function marcarLeida(req: AuthRequest, res: Response) {
  const id = parseInt(req.params.id as string)
  await prisma.notificacion.updateMany({
    where: { id, OR: [{ userId: req.user!.userId }, { userId: null }] },
    data: { leida: true },
  })
  return res.json({ message: 'Marcada como leída' })
}

export async function marcarTodasLeidas(req: AuthRequest, res: Response) {
  await prisma.notificacion.updateMany({
    where: {
      leida: false,
      OR: [{ userId: req.user!.userId }, { userId: null }],
    },
    data: { leida: true },
  })
  return res.json({ message: 'Todas marcadas como leídas' })
}

// Helper para crear notificaciones desde otros servicios
export async function crearNotificacion(
  procesoId: number,
  tipo: TipoNotificacion,
  mensaje: string,
  userId?: number | null,
) {
  return prisma.notificacion.create({
    data: {
      procesoId,
      tipo,
      mensaje,
      userId: userId ?? null,
    },
  })
}

// Generar notificaciones de términos próximos a vencer
export async function generarAlertasTerminos() {
  const now = new Date()
  const enTresDias = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  const terminosPorVencer = await prisma.terminoProceso.findMany({
    where: {
      estado: 'PENDIENTE',
      fechaVencimiento: { gte: now, lte: enTresDias },
    },
    include: {
      proceso: { include: { despachoActual: { include: { usuarios: { include: { user: true } } } } } },
      providencia: { include: { tipoProvidencia: true } },
    },
  })

  for (const termino of terminosPorVencer) {
    const mensaje = `Término próximo a vencer: ${termino.providencia.tipoProvidencia.nombre} del proceso ${termino.proceso.radicado}. Vence: ${termino.fechaVencimiento.toLocaleDateString('es-CO')}`

    // Notificar a usuarios del despacho
    for (const ud of termino.proceso.despachoActual.usuarios) {
      if (!ud.user.activo) continue
      const existente = await prisma.notificacion.findFirst({
        where: {
          procesoId: termino.procesoId,
          tipo: 'ALERTA_VENCIMIENTO',
          userId: ud.user.id,
          createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        },
      })
      if (!existente) {
        await crearNotificacion(termino.procesoId, 'ALERTA_VENCIMIENTO', mensaje, ud.user.id)
      }
    }
  }

  // Notificar términos vencidos
  const terminosVencidos = await prisma.terminoProceso.findMany({
    where: {
      estado: 'VENCIDO',
    },
    include: {
      proceso: { include: { despachoActual: { include: { usuarios: { include: { user: true } } } } } },
      providencia: { include: { tipoProvidencia: true } },
    },
  })

  for (const termino of terminosVencidos) {
    const mensaje = `⚠ TÉRMINO VENCIDO: ${termino.providencia.tipoProvidencia.nombre} del proceso ${termino.proceso.radicado}. Venció el ${termino.fechaVencimiento.toLocaleDateString('es-CO')}`

    for (const ud of termino.proceso.despachoActual.usuarios) {
      if (!ud.user.activo) continue
      const existente = await prisma.notificacion.findFirst({
        where: {
          procesoId: termino.procesoId,
          tipo: 'VENCIDO',
          userId: ud.user.id,
          createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        },
      })
      if (!existente) {
        await crearNotificacion(termino.procesoId, 'VENCIDO', mensaje, ud.user.id)
      }
    }
  }

  return { alertas: terminosPorVencer.length, vencidos: terminosVencidos.length }
}
