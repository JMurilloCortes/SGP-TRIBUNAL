import { Response } from 'express'
import { prisma } from '../config/database'
import { AuthRequest } from '../types'
import { z } from 'zod'
import { ColorEstado } from '@prisma/client'

const createProcesoSchema = z.object({
  radicado: z.string().min(1),
  demandante: z.string().min(1),
  demandado: z.string().min(1),
  instancia: z.enum(['PRIMERA', 'SEGUNDA']),
  fechaIngresoTribunal: z.string(),
  fechaPrimeraInstancia: z.string().nullable().optional(),
  fechaSegundaInstancia: z.string().nullable().optional(),
  juzgadoOrigen: z.string().nullable().optional(),
  claseProcesoId: z.number().int().positive(),
  despachoActualId: z.number().int().positive(),
})

const updateProcesoSchema = createProcesoSchema.partial().extend({
  vigente: z.boolean().optional(),
  etapaActualId: z.number().int().positive().optional(),
  colorEstado: z.nativeEnum(ColorEstado).optional(),
})

export async function list(req: AuthRequest, res: Response) {
  const { search, etapa, despacho, color, vigente, page = '1', limit = '20' } = req.query as Record<string, string>

  const where: any = {}

  if (search) {
    where.OR = [
      { radicado: { contains: search } },
      { demandante: { contains: search } },
      { demandado: { contains: search } },
    ]
  }
  if (etapa) where.etapaActualId = parseInt(etapa)
  if (despacho) where.despachoActualId = parseInt(despacho)
  if (color) where.colorEstado = color as ColorEstado
  if (vigente !== undefined) where.vigente = vigente === 'true'

  // Non-admin users only see their despacho's processes
  if (req.user?.rol !== 'ADMIN' && req.user?.despachoId) {
    where.despachoActualId = req.user.despachoId
  }

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const take = parseInt(limit)

  const [data, total] = await Promise.all([
    prisma.proceso.findMany({
      where,
      include: {
        claseProceso: true,
        etapaActual: true,
        despachoActual: true,
        terminos: {
          where: { estado: 'PENDIENTE' },
          take: 1,
          orderBy: { fechaVencimiento: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.proceso.count({ where }),
  ])

  return res.json({ data, total, page: parseInt(page), totalPages: Math.ceil(total / take) })
}

export async function getById(req: AuthRequest, res: Response) {
  const id = parseInt(req.params.id)
  const proceso = await prisma.proceso.findUnique({
    where: { id },
    include: {
      claseProceso: true,
      etapaActual: true,
      despachoActual: true,
      providencias: {
        include: { tipoProvidencia: true, terminos: true },
        orderBy: { createdAt: 'desc' },
      },
      terminos: {
        include: { providencia: { include: { tipoProvidencia: true } } },
        orderBy: { fechaVencimiento: 'asc' },
      },
      actuaciones: {
        include: { user: { select: { nombre: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!proceso) return res.status(404).json({ message: 'Proceso no encontrado' })
  return res.json(proceso)
}

export async function create(req: AuthRequest, res: Response) {
  const data = createProcesoSchema.parse(req.body)

  const existing = await prisma.proceso.findUnique({ where: { radicado: data.radicado } })
  if (existing) return res.status(400).json({ message: 'Ya existe un proceso con ese radicado' })

  const proceso = await prisma.proceso.create({
    data: {
      radicado: data.radicado,
      demandante: data.demandante,
      demandado: data.demandado,
      instancia: data.instancia,
      fechaIngresoTribunal: new Date(data.fechaIngresoTribunal),
      fechaPrimeraInstancia: data.fechaPrimeraInstancia ? new Date(data.fechaPrimeraInstancia) : null,
      fechaSegundaInstancia: data.fechaSegundaInstancia ? new Date(data.fechaSegundaInstancia) : null,
      juzgadoOrigen: data.juzgadoOrigen ?? null,
      claseProcesoId: data.claseProcesoId,
      despachoActualId: data.despachoActualId,
      etapaActualId: 1, // Radicado
      colorEstado: ColorEstado.VERDE,
    },
    include: {
      claseProceso: true,
      etapaActual: true,
      despachoActual: true,
    },
  })

  // Create actuacion
  await prisma.actuacion.create({
    data: {
      procesoId: proceso.id,
      userId: req.user!.userId,
      descripcion: `Proceso radicado con el No. ${proceso.radicado}`,
    },
  })

  return res.status(201).json(proceso)
}

export async function update(req: AuthRequest, res: Response) {
  const id = parseInt(req.params.id)
  const data = updateProcesoSchema.parse(req.body)

  const proceso = await prisma.proceso.findUnique({ where: { id } })
  if (!proceso) return res.status(404).json({ message: 'Proceso no encontrado' })

  const updated = await prisma.proceso.update({
    where: { id },
    data: {
      ...(data.radicado !== undefined && { radicado: data.radicado }),
      ...(data.demandante !== undefined && { demandante: data.demandante }),
      ...(data.demandado !== undefined && { demandado: data.demandado }),
      ...(data.instancia !== undefined && { instancia: data.instancia }),
      ...(data.fechaIngresoTribunal !== undefined && { fechaIngresoTribunal: new Date(data.fechaIngresoTribunal) }),
      ...(data.fechaPrimeraInstancia !== undefined && { fechaPrimeraInstancia: data.fechaPrimeraInstancia ? new Date(data.fechaPrimeraInstancia) : null }),
      ...(data.fechaSegundaInstancia !== undefined && { fechaSegundaInstancia: data.fechaSegundaInstancia ? new Date(data.fechaSegundaInstancia) : null }),
      ...(data.juzgadoOrigen !== undefined && { juzgadoOrigen: data.juzgadoOrigen }),
      ...(data.claseProcesoId !== undefined && { claseProcesoId: data.claseProcesoId }),
      ...(data.despachoActualId !== undefined && { despachoActualId: data.despachoActualId }),
      ...(data.etapaActualId !== undefined && { etapaActualId: data.etapaActualId }),
      ...(data.vigente !== undefined && { vigente: data.vigente }),
      ...(data.colorEstado !== undefined && { colorEstado: data.colorEstado }),
    },
    include: {
      claseProceso: true,
      etapaActual: true,
      despachoActual: true,
    },
  })

  return res.json(updated)
}

export async function cambiarEtapa(req: AuthRequest, res: Response) {
  const id = parseInt(req.params.id)
  const { etapaActualId, descripcion } = z.object({
    etapaActualId: z.number().int().positive(),
    descripcion: z.string().optional(),
  }).parse(req.body)

  const proceso = await prisma.proceso.findUnique({ where: { id } })
  if (!proceso) return res.status(404).json({ message: 'Proceso no encontrado' })

  const updated = await prisma.proceso.update({
    where: { id },
    data: { etapaActualId },
    include: {
      claseProceso: true,
      etapaActual: true,
      despachoActual: true,
    },
  })

  await prisma.actuacion.create({
    data: {
      procesoId: id,
      userId: req.user!.userId,
      descripcion: descripcion || `Cambio a etapa: ${updated.etapaActual.nombre}`,
    },
  })

  return res.json(updated)
}
