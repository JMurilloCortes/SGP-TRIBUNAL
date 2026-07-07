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

  // === USUARIOS (sin Admin) ===
  await prisma.userDespacho.deleteMany()
  await prisma.user.deleteMany({ where: { rol: { in: ['ESCRIBIENTE', 'NOTIFICADOR'] } } })

  // 3 ESCRIBIENTES
  const esc1 = await prisma.user.create({
    data: { nombre: 'Merly Esmeralda Mosquera Garcia', email: 'mmosqueg@cendoj.ramajudicial.gov.co', passwordHash: await bcrypt.hash('Merly.123', 10), rol: Rol.ESCRIBIENTE },
  })
  const esc2 = await prisma.user.create({
    data: { nombre: 'Marcel Caballero Palacios', email: 'mcaballp@cendoj.ramajudicial.gov.co', passwordHash: await bcrypt.hash('Marcel.123', 10), rol: Rol.ESCRIBIENTE },
  })
  const esc3 = await prisma.user.create({
    data: { nombre: 'Libia Marcella Salamandra Pacheco', email: 'lsalamap@cendoj.ramajudicial.gov.co', passwordHash: await bcrypt.hash('Libia.123', 10), rol: Rol.ESCRIBIENTE },
  })

  // 2 NOTIFICADORES
  const not1 = await prisma.user.create({
    data: { nombre: 'Eleazar Ortiz Beytar', email: 'eortizb@cendoj.ramajudicial.gov.co', passwordHash: await bcrypt.hash('Eleazar.123', 10), rol: Rol.NOTIFICADOR },
  })
  const not2 = await prisma.user.create({
    data: { nombre: 'Aura Maria Mena Mosquera', email: 'amenam@cendoj.ramajudicial.gov.co', passwordHash: await bcrypt.hash('Aura.123', 10), rol: Rol.NOTIFICADOR },
  })

  // === ASIGNACIONES (users_despachos) ===
  await prisma.userDespacho.createMany({
    data: [
      { userId: esc1.id, despachoId: d3.id },
      { userId: esc1.id, despachoId: d4.id },
      { userId: esc2.id, despachoId: d2.id },
      { userId: esc3.id, despachoId: d1.id },
      { userId: esc3.id, despachoId: d5.id },
      { userId: not1.id, despachoId: d1.id },
      { userId: not1.id, despachoId: d2.id },
      { userId: not1.id, despachoId: d3.id },
      { userId: not1.id, despachoId: d4.id },
      { userId: not1.id, despachoId: d5.id },
      { userId: not2.id, despachoId: d1.id },
      { userId: not2.id, despachoId: d2.id },
      { userId: not2.id, despachoId: d3.id },
      { userId: not2.id, despachoId: d4.id },
      { userId: not2.id, despachoId: d5.id },
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

  // === CONSECUTIVOS (0001–3500) ===
  const existing = await prisma.consecutivo.count()
  if (existing === 0) {
    const data = Array.from({ length: 3500 }, (_, i) => ({
      numero: String(i + 1).padStart(4, '0'),
    }))
    await prisma.consecutivo.createMany({ data })
    console.log(`- ${data.length} consecutivos (0001–3500)`)
  } else {
    console.log(`- ${existing} consecutivos (ya existían)`)
  }

  console.log('Seed ejecutado correctamente')
  console.log(`- ${despachos.length} despachos`)
  console.log(`- ${juzgados.length} juzgados administrativos`)
  console.log(`- 1 admin + 3 escribientes + 2 notificadores`)
  console.log('  Merly Esmeralda Mosquera Garcia → D003, D004')
  console.log('  Marcel Caballero Palacios       → D002')
  console.log('  Libia Marcella Salamandra Pacheco → D001, D005')
  console.log('  Eleazar Ortiz Beytar            → Notificador (todos los despachos)')
  console.log('  Aura Maria Mena Mosquera        → Notificador (todos los despachos)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
