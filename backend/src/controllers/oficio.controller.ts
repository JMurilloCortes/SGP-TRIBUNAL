import { Request, Response } from 'express'
import { prisma } from '../config/database'
import { AuthRequest } from '../types'
import { z } from 'zod'
import {
  generarOficioDevolverJuzgado,
  generarOficioComunicarProvidencia,
  generarOficioSolicitarInformes,
  generarOficioComisionNotificar,
  bufferFromDocument,
} from '../services/oficio.service'

const modelosOficio: Record<number, { nombre: string; descripcion: string }> = {
  1: { nombre: 'Devolver al juzgado de origen', descripcion: 'Oficio remitiendo el expediente al juzgado de origen una vez surtido el trámite en el Tribunal' },
  2: { nombre: 'Comunicar providencia a entidad', descripcion: 'Oficio comunicando una providencia a la entidad correspondiente' },
  3: { nombre: 'Solicitar informes', descripcion: 'Oficio solicitando informes a una entidad dentro del proceso' },
  4: { nombre: 'Comisión para notificación personal', descripcion: 'Oficio comisionando a otro despacho para practicar notificación personal' },
}

export async function listarModelos(_req: Request, res: Response) {
  return res.json(Object.entries(modelosOficio).map(([id, m]) => ({ id: Number(id), ...m })))
}

const generarOficioSchema = z.object({
  modeloId: z.number().int().positive(),
  destinatario: z.string().min(1),
  cargo: z.string().min(1),
  entidad: z.string().min(1),
  direccion: z.string().min(1),
  asunto: z.string().min(1),
  consecutivoId: z.number().int().positive().optional(),
})

export async function generarOficio(req: AuthRequest, res: Response) {
  const procesoId = parseInt(req.params.id as string)
  const data = generarOficioSchema.parse(req.body)

  const proceso = await prisma.proceso.findUnique({
    where: { id: procesoId },
    include: { despachoActual: true },
  })
  if (!proceso) return res.status(404).json({ message: 'Proceso no encontrado' })

  const modelo = modelosOficio[data.modeloId]
  if (!modelo) return res.status(400).json({ message: 'Modelo de oficio inválido' })

  const result = await prisma.$transaction(async (tx) => {
    let numeroOficio = ''
    if (data.consecutivoId) {
      const c = await tx.consecutivo.findUnique({ where: { id: data.consecutivoId } })
      if (!c || c.tipo !== 'OFICIO') {
        throw new Error('Consecutivo inválido')
      }
      if (c.estado !== 'DISPONIBLE') {
        throw new Error(`El consecutivo ${c.numero} ya está ocupado`)
      }
      await tx.consecutivo.update({
        where: { id: c.id },
        data: { estado: 'OCUPADO', tomadoPor: req.user!.userId },
      })
      numeroOficio = c.numero
    }

    const datos = {
      ciudad: 'Quibdó',
      radicado: proceso.radicado,
      demandante: proceso.demandante,
      demandado: proceso.demandado,
      fecha: new Date(),
      destinatario: data.destinatario,
      cargo: data.cargo,
      entidad: data.entidad,
      direccion: data.direccion,
      asunto: data.asunto,
      despachoOrigen: proceso.despachoActual?.nombre,
      numeroOficio,
    }

    let doc
    switch (data.modeloId) {
      case 1:
        doc = generarOficioDevolverJuzgado(datos)
        break
      case 2:
        doc = generarOficioComunicarProvidencia(datos)
        break
      case 3:
        doc = generarOficioSolicitarInformes(datos)
        break
      case 4:
        doc = generarOficioComisionNotificar(datos)
        break
      default:
        throw new Error('Modelo no implementado')
    }

    const buffer = await bufferFromDocument(doc)

    await tx.actuacion.create({
      data: {
        procesoId,
        userId: req.user!.userId,
        descripcion: `Se generó oficio${numeroOficio ? ` Nro. ${numeroOficio}` : ''}: ${modelo.nombre} dirigido a ${data.destinatario} - ${data.entidad}`,
      },
    })

    return { buffer, numeroOficio }
  })

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  res.setHeader('Content-Disposition', `attachment; filename="oficio_${result.numeroOficio || proceso.radicado}.docx"`)
  res.send(result.buffer)
}
