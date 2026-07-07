import { Response } from 'express'
import { prisma } from '../config/database'

export async function getDespachos(_req: any, res: Response) {
  const data = await prisma.despacho.findMany({ orderBy: { nombre: 'asc' } })
  return res.json(data)
}

export async function getClasesProceso(_req: any, res: Response) {
  const data = await prisma.claseProceso.findMany({ orderBy: { nombre: 'asc' } })
  return res.json(data)
}

export async function getEtapas(_req: any, res: Response) {
  const data = await prisma.etapa.findMany({ orderBy: { orden: 'asc' } })
  return res.json(data)
}

export async function getTiposProvidencia(_req: any, res: Response) {
  const data = await prisma.tipoProvidencia.findMany({ orderBy: { nombre: 'asc' } })
  return res.json(data)
}

export async function getJuzgados(_req: any, res: Response) {
  const data = await prisma.juzgado.findMany({ orderBy: { nombre: 'asc' } })
  return res.json(data)
}
