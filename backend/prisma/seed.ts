import { PrismaClient, Rol, ColorEstado, Instancia, EstadoTermino, TipoNotificacion, OrdenProvidencia } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Despachos
  const despacho1 = await prisma.despacho.upsert({
    where: { codigo: 'D001' },
    update: {},
    create: { nombre: 'Despacho 001', codigo: 'D001' },
  })
  const despacho2 = await prisma.despacho.upsert({
    where: { codigo: 'D002' },
    update: {},
    create: { nombre: 'Despacho 002', codigo: 'D002' },
  })
  const despacho3 = await prisma.despacho.upsert({
    where: { codigo: 'D003' },
    update: {},
    create: { nombre: 'Despacho 003', codigo: 'D003' },
  })

  // Admin user
  const passwordHash = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@tribunalchoco.gov.co' },
    update: {},
    create: {
      nombre: 'Admin',
      email: 'admin@tribunalchoco.gov.co',
      passwordHash,
      rol: Rol.ADMIN,
    },
  })

  // Clases de proceso
  const clases = [
    'Nulidad',
    'Reparación Directa',
    'Contractual',
    'Popular',
    'Grupo',
    'Cumplimiento',
  ]
  for (const nombre of clases) {
    await prisma.claseProceso.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    })
  }

  // Etapas
  const etapas = [
    { nombre: 'Radicado', orden: 1 },
    { nombre: 'Admisión', orden: 2 },
    { nombre: 'Traslado', orden: 3 },
    { nombre: 'Pruebas', orden: 4 },
    { nombre: 'Alegatos', orden: 5 },
    { nombre: 'Sentencia', orden: 6 },
    { nombre: 'Archivado', orden: 7 },
  ]
  for (const etapa of etapas) {
    await prisma.etapa.upsert({
      where: { nombre: etapa.nombre },
      update: {},
      create: etapa,
    })
  }

  // Tipos de providencia
  const tipos = [
    { nombre: 'Auto admisorio', diasTermino: 5, ordenPredeterminada: OrdenProvidencia.ADMITIR },
    { nombre: 'Auto inadmisorio', diasTermino: 3, ordenPredeterminada: OrdenProvidencia.INADMITIR },
    { nombre: 'Auto de pruebas', diasTermino: 10, ordenPredeterminada: OrdenProvidencia.OTRO },
    { nombre: 'Auto que corre traslado', diasTermino: 5, ordenPredeterminada: OrdenProvidencia.OTRO },
    { nombre: 'Sentencia', diasTermino: 15, ordenPredeterminada: OrdenProvidencia.SENTENCIA },
    { nombre: 'Auto de obedecimiento', diasTermino: 3, ordenPredeterminada: OrdenProvidencia.ARCHIVAR },
    { nombre: 'Auto que remite a la Corte', diasTermino: 5, ordenPredeterminada: OrdenProvidencia.REMITIR_CORTE },
    { nombre: 'Auto que remite al Consejo de Estado', diasTermino: 5, ordenPredeterminada: OrdenProvidencia.REMITIR_CONSEJO_ESTADO },
    { nombre: 'Auto que devuelve al juzgado', diasTermino: 3, ordenPredeterminada: OrdenProvidencia.DEVOLVER_JUZGADO },
  ]
  for (const tipo of tipos) {
    await prisma.tipoProvidencia.upsert({
      where: { nombre: tipo.nombre },
      update: {},
      create: tipo,
    })
  }

  console.log('Seed ejecutado correctamente')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
