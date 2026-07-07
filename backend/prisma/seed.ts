import { PrismaClient, Rol } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // === 5 DESPACHOS ===
  const d1 = await prisma.despacho.upsert({ where: { codigo: 'D001' }, update: {}, create: { nombre: 'Despacho 001', codigo: 'D001' } })
  const d2 = await prisma.despacho.upsert({ where: { codigo: 'D002' }, update: {}, create: { nombre: 'Despacho 002', codigo: 'D002' } })
  const d3 = await prisma.despacho.upsert({ where: { codigo: 'D003' }, update: {}, create: { nombre: 'Despacho 003', codigo: 'D003' } })
  const d4 = await prisma.despacho.upsert({ where: { codigo: 'D004' }, update: {}, create: { nombre: 'Despacho 004', codigo: 'D004' } })
  const d5 = await prisma.despacho.upsert({ where: { codigo: 'D005' }, update: {}, create: { nombre: 'Despacho 005', codigo: 'D005' } })
  const despachos = [d1, d2, d3, d4, d5]

  // === ADMIN ===
  const adminHash = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@tribunalchoco.gov.co' },
    update: {},
    create: {
      nombre: 'Admin',
      email: 'admin@tribunalchoco.gov.co',
      passwordHash: adminHash,
      rol: Rol.ADMIN,
    },
  })

  // === 3 ESCRIBIENTES ===
  // Escribiente 1: 2 despachos (D001, D002)
  const esc1Hash = await bcrypt.hash('escribiente1', 10)
  const esc1 = await prisma.user.upsert({
    where: { email: 'andres.garcia@tribunalchoco.gov.co' },
    update: {},
    create: {
      nombre: 'Andrés García',
      email: 'andres.garcia@tribunalchoco.gov.co',
      passwordHash: esc1Hash,
      rol: Rol.ESCRIBIENTE,
    },
  })

  // Escribiente 2: 2 despachos (D003, D004)
  const esc2Hash = await bcrypt.hash('escribiente2', 10)
  const esc2 = await prisma.user.upsert({
    where: { email: 'maria.lopez@tribunalchoco.gov.co' },
    update: {},
    create: {
      nombre: 'María López',
      email: 'maria.lopez@tribunalchoco.gov.co',
      passwordHash: esc2Hash,
      rol: Rol.ESCRIBIENTE,
    },
  })

  // Escribiente 3: 1 despacho (D005)
  const esc3Hash = await bcrypt.hash('escribiente3', 10)
  const esc3 = await prisma.user.upsert({
    where: { email: 'carlos.perez@tribunalchoco.gov.co' },
    update: {},
    create: {
      nombre: 'Carlos Pérez',
      email: 'carlos.perez@tribunalchoco.gov.co',
      passwordHash: esc3Hash,
      rol: Rol.ESCRIBIENTE,
    },
  })

  // === ASIGNACIONES (users_despachos) ===
  // Limpiar asignaciones existentes
  await prisma.userDespacho.deleteMany()

  // Escribiente 1 → D001, D002
  await prisma.userDespacho.createMany({
    data: [
      { userId: esc1.id, despachoId: despachos[0].id },
      { userId: esc1.id, despachoId: despachos[1].id },
    ],
  })

  // Escribiente 2 → D003, D004
  await prisma.userDespacho.createMany({
    data: [
      { userId: esc2.id, despachoId: despachos[2].id },
      { userId: esc2.id, despachoId: despachos[3].id },
    ],
  })

  // Escribiente 3 → D005
  await prisma.userDespacho.createMany({
    data: [
      { userId: esc3.id, despachoId: despachos[4].id },
    ],
  })

  // === 9 JUZGADOS ADMINISTRATIVOS DE QUIBDÓ ===
  const juzgados = [
    { nombre: 'Juzgado 01 Administrativo de Quibdó', codigo: 'J01AQO' },
    { nombre: 'Juzgado 02 Administrativo de Quibdó', codigo: 'J02AQO' },
    { nombre: 'Juzgado 03 Administrativo de Quibdó', codigo: 'J03AQO' },
    { nombre: 'Juzgado 04 Administrativo de Quibdó', codigo: 'J04AQO' },
    { nombre: 'Juzgado 05 Administrativo de Quibdó', codigo: 'J05AQO' },
    { nombre: 'Juzgado 06 Administrativo de Quibdó', codigo: 'J06AQO' },
    { nombre: 'Juzgado 07 Administrativo de Quibdó', codigo: 'J07AQO' },
    { nombre: 'Juzgado 08 Administrativo de Quibdó', codigo: 'J08AQO' },
    { nombre: 'Juzgado 09 Administrativo de Quibdó', codigo: 'J09AQO' },
  ]
  for (const j of juzgados) {
    await prisma.juzgado.upsert({
      where: { codigo: j.codigo },
      update: {},
      create: j,
    })
  }

  // === CLASES DE PROCESO ===
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

  // === ETAPAS PROCESALES ===
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

  // === TIPOS DE PROVIDENCIA ===
  const tipos = [
    { nombre: 'Auto admisorio', diasTermino: 5, ordenPredeterminada: 'ADMITIR' },
    { nombre: 'Auto inadmisorio', diasTermino: 3, ordenPredeterminada: 'INADMITIR' },
    { nombre: 'Auto de pruebas', diasTermino: 10, ordenPredeterminada: 'OTRO' },
    { nombre: 'Auto que corre traslado', diasTermino: 5, ordenPredeterminada: 'OTRO' },
    { nombre: 'Sentencia', diasTermino: 15, ordenPredeterminada: 'SENTENCIA' },
    { nombre: 'Auto de obedecimiento', diasTermino: 3, ordenPredeterminada: 'ARCHIVAR' },
    { nombre: 'Auto que remite a la Corte', diasTermino: 5, ordenPredeterminada: 'REMITIR_CORTE' },
    { nombre: 'Auto que remite al Consejo de Estado', diasTermino: 5, ordenPredeterminada: 'REMITIR_CONSEJO_ESTADO' },
    { nombre: 'Auto que devuelve al juzgado', diasTermino: 3, ordenPredeterminada: 'DEVOLVER_JUZGADO' },
  ]
  for (const tipo of tipos) {
    await prisma.tipoProvidencia.upsert({
      where: { nombre: tipo.nombre },
      update: {},
      create: tipo as any,
    })
  }

  console.log('Seed ejecutado correctamente')
  console.log(`- ${despachos.length} despachos`)
  console.log(`- ${juzgados.length} juzgados administrativos`)
  // === 2 NOTIFICADORES (notifican todos los despachos) ===
  const not1Hash = await bcrypt.hash('notificador1', 10)
  const not1 = await prisma.user.upsert({
    where: { email: 'juan.notificador@tribunalchoco.gov.co' },
    update: {},
    create: {
      nombre: 'Juan Martínez',
      email: 'juan.notificador@tribunalchoco.gov.co',
      passwordHash: not1Hash,
      rol: 'NOTIFICADOR' as any,
    },
  })
  for (const d of despachos) {
    await prisma.userDespacho.upsert({ where: { userId_despachoId: { userId: not1.id, despachoId: d.id } }, update: {}, create: { userId: not1.id, despachoId: d.id } })
  }

  const not2Hash = await bcrypt.hash('notificador2', 10)
  const not2 = await prisma.user.upsert({
    where: { email: 'maria.rodriguez@tribunalchoco.gov.co' },
    update: {},
    create: {
      nombre: 'María Rodríguez',
      email: 'maria.rodriguez@tribunalchoco.gov.co',
      passwordHash: not2Hash,
      rol: 'NOTIFICADOR' as any,
    },
  })
  for (const d of despachos) {
    await prisma.userDespacho.upsert({ where: { userId_despachoId: { userId: not2.id, despachoId: d.id } }, update: {}, create: { userId: not2.id, despachoId: d.id } })
  }

  console.log(`- 1 admin + 3 escribientes + 2 notificadores`)
  console.log('  Andrés García   → D001, D002')
  console.log('  María López     → D003, D004')
  console.log('  Carlos Pérez    → D005')
  console.log('  Juan Martínez   → Notificador (todos los despachos)')
  console.log('  María Rodríguez → Notificador (todos los despachos)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
