import { Response } from 'express'
import { prisma } from '../config/database'
import { AuthRequest } from '../types'
import { z } from 'zod'
import { EstadoTermino, ColorEstado } from '@prisma/client'
import { addBusinessDays, calcularColor } from '../services/termino.service'
import { crearNotificacion } from './notificacion.controller'

const createProvidenciaSchema = z.object({
  tipoProvidenciaId: z.number().int().positive(),
  fechaProvidencia: z.string(),
  descripcion: z.string().optional(),
  orden: z.string().optional(),
})

export async function list(req: AuthRequest, res: Response) {
  const id = parseInt(req.params.id as string)
  const data = await prisma.providencia.findMany({
    where: { procesoId: id },
    include: {
      tipoProvidencia: true,
      terminos: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return res.json(data)
}

export async function create(req: AuthRequest, res: Response) {
  const procesoId = parseInt(req.params.id as string)
  const data = createProvidenciaSchema.parse(req.body)

  const proceso = await prisma.proceso.findUnique({ where: { id: procesoId } })
  if (!proceso) return res.status(404).json({ message: 'Proceso no encontrado' })

  const tipo = await prisma.tipoProvidencia.findUnique({
    where: { id: data.tipoProvidenciaId },
  })
  if (!tipo) return res.status(400).json({ message: 'Tipo de providencia inválido' })

  const providencia = await prisma.providencia.create({
    data: {
      procesoId,
      tipoProvidenciaId: data.tipoProvidenciaId,
      fechaProvidencia: new Date(data.fechaProvidencia),
      fechaNotificacion: null,
      descripcion: data.descripcion ?? null,
      orden: (data.orden as any) ?? tipo.ordenPredeterminada,
    },
    include: {
      tipoProvidencia: true,
    },
  })

  // Create actuacion
  await prisma.actuacion.create({
    data: {
      procesoId,
      userId: req.user!.userId,
      descripcion: `Se registró providencia: ${tipo.nombre} (pendiente de notificar)`,
    },
  })

  // Notify notificadores about pending notification
  const notificadores = await prisma.user.findMany({
    where: { activo: true, rol: 'NOTIFICADOR' },
  })
  for (const user of notificadores) {
    await crearNotificacion(
      procesoId,
      'TAREA',
      `Providencia pendiente de notificar: ${tipo.nombre} en proceso ${proceso.radicado}`,
      user.id,
    )
  }

  return res.status(201).json(providencia)
}

export async function notificar(req: AuthRequest, res: Response) {
  const id = parseInt(req.params.id as string)

  const providencia = await prisma.providencia.findUnique({
    where: { id },
    include: { proceso: true, tipoProvidencia: true },
  })
  if (!providencia) return res.status(404).json({ message: 'Providencia no encontrada' })
  if (providencia.fechaNotificacion) return res.status(400).json({ message: 'Esta providencia ya fue notificada' })

  const ahora = new Date()
  const fechaVencimiento = addBusinessDays(ahora, providencia.tipoProvidencia.diasTermino)

  const updated = await prisma.providencia.update({
    where: { id },
    data: {
      fechaNotificacion: ahora,
      terminos: {
        create: {
          procesoId: providencia.procesoId,
          diasTotales: providencia.tipoProvidencia.diasTermino,
          fechaInicio: ahora,
          fechaVencimiento,
          estado: EstadoTermino.PENDIENTE,
        },
      },
    },
    include: {
      tipoProvidencia: true,
      terminos: true,
    },
  })

  // Update proceso color
  const color = calcularColor(fechaVencimiento)
  await prisma.proceso.update({
    where: { id: providencia.procesoId },
    data: { colorEstado: color },
  })

  // Create actuacion
  await prisma.actuacion.create({
    data: {
      procesoId: providencia.procesoId,
      userId: req.user!.userId,
      descripcion: `Providencia notificada: ${providencia.tipoProvidencia.nombre}. Término: ${providencia.tipoProvidencia.diasTermino} días hábiles`,
    },
  })

  // Notify users in the despacho
  const users = await prisma.user.findMany({
    where: {
      activo: true,
      despachos: { some: { despachoId: providencia.proceso.despachoActualId } },
    },
  })
  for (const user of users) {
    await crearNotificacion(
      providencia.procesoId,
      'TAREA',
      `Providencia notificada: ${providencia.tipoProvidencia.nombre} en proceso ${providencia.proceso.radicado}. Término: ${providencia.tipoProvidencia.diasTermino} días hábiles. Vence: ${fechaVencimiento.toLocaleDateString('es-CO')}`,
      user.id,
    )
  }

  return res.json(updated)
}

export async function listPendientes(_req: AuthRequest, res: Response) {
  const data = await prisma.providencia.findMany({
    where: { fechaNotificacion: null },
    include: {
      proceso: {
        select: { id: true, radicado: true, demandante: true, demandado: true, despachoActual: { select: { nombre: true, codigo: true } } },
      },
      tipoProvidencia: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return res.json(data)
}

export async function remove(req: AuthRequest, res: Response) {
  const id = parseInt(req.params.id as string)
  const providencia = await prisma.providencia.findUnique({ where: { id } })
  if (!providencia) return res.status(404).json({ message: 'Providencia no encontrada' })

  await prisma.terminoProceso.deleteMany({ where: { providenciaId: id } })
  await prisma.providencia.delete({ where: { id } })

  return res.json({ message: 'Providencia eliminada' })
}

export async function cumplirTermino(req: AuthRequest, res: Response) {
  const id = parseInt(req.params.id as string)

  const termino = await prisma.terminoProceso.findUnique({
    where: { id },
    include: { proceso: true },
  })
  if (!termino) return res.status(404).json({ message: 'Término no encontrado' })

  const updated = await prisma.terminoProceso.update({
    where: { id },
    data: {
      estado: EstadoTermino.CUMPLIDO,
      fechaCumplimiento: new Date(),
    },
  })

  // Recalcular color del proceso basado en otros términos pendientes
  const pendientes = await prisma.terminoProceso.findMany({
    where: { procesoId: termino.procesoId, estado: EstadoTermino.PENDIENTE },
    orderBy: { fechaVencimiento: 'asc' },
  })

  let nuevoColor: ColorEstado = ColorEstado.GRIS
  if (pendientes.length > 0) {
    nuevoColor = calcularColor(pendientes[0].fechaVencimiento)
  } else {
    // Check if proceso is archived/completed
    const proceso = await prisma.proceso.findUnique({
      where: { id: termino.procesoId },
      include: { etapaActual: true },
    })
    if (proceso?.etapaActual.nombre === 'Archivado') {
      nuevoColor = ColorEstado.GRIS
    } else {
      nuevoColor = ColorEstado.VERDE
    }
  }

  await prisma.proceso.update({
    where: { id: termino.procesoId },
    data: { colorEstado: nuevoColor },
  })

  await prisma.actuacion.create({
    data: {
      procesoId: termino.procesoId,
      userId: req.user!.userId,
      descripcion: `Término cumplido (${termino.diasTotales} días hábiles)`,
    },
  })

  return res.json(updated)
}

// Cron job to check vencidos terms
export async function verificarTerminosVencidos() {
  const now = new Date()
  const vencidos = await prisma.terminoProceso.updateMany({
    where: {
      estado: EstadoTermino.PENDIENTE,
      fechaVencimiento: { lt: now },
    },
    data: {
      estado: EstadoTermino.VENCIDO,
    },
  })

  if (vencidos.count > 0) {
    // Actualizar colores de procesos con términos vencidos
    const procesosVencidos = await prisma.terminoProceso.findMany({
      where: { estado: EstadoTermino.VENCIDO },
      select: { procesoId: true },
      distinct: ['procesoId'],
    })

    for (const p of procesosVencidos) {
      await prisma.proceso.update({
        where: { id: p.procesoId },
        data: { colorEstado: ColorEstado.ROJO },
      })
    }

    // Update colors for processes nearing expiration
    const todosProcesos = await prisma.proceso.findMany({
      where: { vigente: true, colorEstado: { not: ColorEstado.GRIS } },
      include: {
        terminos: {
          where: { estado: EstadoTermino.PENDIENTE },
          orderBy: { fechaVencimiento: 'asc' },
          take: 1,
        },
      },
    })

    for (const proceso of todosProcesos) {
      if (proceso.terminos.length > 0) {
        const color = calcularColor(proceso.terminos[0].fechaVencimiento)
        if (color !== proceso.colorEstado) {
          await prisma.proceso.update({
            where: { id: proceso.id },
            data: { colorEstado: color },
          })
        }
      }
    }
  }

  return vencidos.count
}
