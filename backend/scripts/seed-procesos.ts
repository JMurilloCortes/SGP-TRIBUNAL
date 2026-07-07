import { prisma } from '../src/config/database'

async function main() {
  await prisma.terminoProceso.deleteMany()
  await prisma.providencia.deleteMany()
  await prisma.notificacion.deleteMany()
  await prisma.actuacion.deleteMany()
  await prisma.proceso.deleteMany()

  const clases = await prisma.claseProceso.findMany()
  const etapas = await prisma.etapa.findMany()
  const juzgados = await prisma.juzgado.findMany({ select: { id: true, codigo: true } })
  const despachos = await prisma.despacho.findMany({ select: { id: true, codigo: true } })

  const etapaRadicado = etapas.find(e => e.nombre === 'Radicado')!.id
  const etapaAdmision = etapas.find(e => e.nombre === 'Admisión')!.id
  const etapaPruebas = etapas.find(e => e.nombre === 'Pruebas')!.id
  const etapaSentencia = etapas.find(e => e.nombre === 'Sentencia')!.id
  const etapaArchivado = etapas.find(e => e.nombre === 'Archivado')!.id

  const clsNulidad = clases.find(c => c.nombre === 'Nulidad')!.id
  const clsReparacion = clases.find(c => c.nombre === 'Reparación Directa')!.id
  const clsContractual = clases.find(c => c.nombre === 'Contractual')!.id
  const clsPopular = clases.find(c => c.nombre === 'Popular')!.id
  const clsCumplimiento = clases.find(c => c.nombre === 'Cumplimiento')!.id

  const tipoAutoAdmisorio = 1
  const tipoAutoPruebas = 3
  const tipoAutoTraslado = 4
  const tipoSentencia = 5

  const procesos = [
    { radicado: '27001-33-33-001-2023-00123-00', demandante: 'Carlos Andrés Mosquera Córdoba', demandado: 'Municipio de Quibdó', claseProcesoId: clsNulidad, etapaActualId: etapaPruebas, despachoActualId: 1, juzgadoOrigenId: null, instancia: 'PRIMERA', fechaIngresoTribunal: new Date('2023-05-10') },
    { radicado: '27001-33-33-002-2023-00456-00', demandante: 'María Elena Palacios Mena', demandado: 'Departamento del Chocó', claseProcesoId: clsReparacion, etapaActualId: etapaAdmision, despachoActualId: 1, juzgadoOrigenId: 1, instancia: 'SEGUNDA', fechaIngresoTribunal: new Date('2023-08-22') },
    { radicado: '27001-33-33-003-2024-00189-00', demandante: 'Jorge Isaac Rentería Rivas', demandado: 'ESE Hospital San Francisco de Asís', claseProcesoId: clsReparacion, etapaActualId: etapaPruebas, despachoActualId: 2, juzgadoOrigenId: null, instancia: 'PRIMERA', fechaIngresoTribunal: new Date('2024-01-15') },
    { radicado: '27001-33-33-004-2024-00321-00', demandante: 'Luz Dary Moya Sánchez', demandado: 'Fiscalía General de la Nación', claseProcesoId: clsCumplimiento, etapaActualId: etapaRadicado, despachoActualId: 2, juzgadoOrigenId: 4, instancia: 'SEGUNDA', fechaIngresoTribunal: new Date('2024-03-08') },
    { radicado: '27001-33-33-005-2022-00789-00', demandante: 'Pedro Antonio Valoyes Palacios', demandado: 'Corporación Autónoma Regional del Chocó', claseProcesoId: clsNulidad, etapaActualId: etapaArchivado, despachoActualId: 3, juzgadoOrigenId: null, instancia: 'PRIMERA', fechaIngresoTribunal: new Date('2022-11-30') },
    { radicado: '27001-33-33-006-2024-00234-00', demandante: 'Yenifer Patricia Cuesta Palacios', demandado: 'Gobernación del Chocó', claseProcesoId: clsContractual, etapaActualId: etapaPruebas, despachoActualId: 3, juzgadoOrigenId: 6, instancia: 'SEGUNDA', fechaIngresoTribunal: new Date('2024-06-01') },
    { radicado: '27001-33-33-007-2023-00567-00', demandante: 'William de Jesús Mosquera Maturana', demandado: 'Municipio de Istmina', claseProcesoId: clsPopular, etapaActualId: etapaSentencia, despachoActualId: 4, juzgadoOrigenId: null, instancia: 'PRIMERA', fechaIngresoTribunal: new Date('2023-10-05') },
    { radicado: '27001-33-33-008-2025-00111-00', demandante: 'Nini Johanna Asprilla Córdoba', demandado: 'Nación - Ministerio de Defensa', claseProcesoId: clsReparacion, etapaActualId: etapaRadicado, despachoActualId: 4, juzgadoOrigenId: 8, instancia: 'SEGUNDA', fechaIngresoTribunal: new Date('2025-02-14') },
    { radicado: '27001-33-33-009-2024-00987-00', demandante: 'Álvaro Antonio Hinestroza Cossio', demandado: 'Alcaldía de Quibdó', claseProcesoId: clsContractual, etapaActualId: etapaAdmision, despachoActualId: 5, juzgadoOrigenId: null, instancia: 'PRIMERA', fechaIngresoTribunal: new Date('2024-09-20') },
    { radicado: '27001-33-33-010-2023-00345-00', demandante: 'Diana Milena Córdoba Palacios', demandado: 'Departamento Administrativo de la Presidencia', claseProcesoId: clsPopular, etapaActualId: etapaArchivado, despachoActualId: 5, juzgadoOrigenId: 2, instancia: 'SEGUNDA', fechaIngresoTribunal: new Date('2023-04-12') },
  ]

  for (const p of procesos) {
    await prisma.proceso.create({ data: p as any })
    console.log(`  ✓ ${p.radicado} — ${p.demandante}`)
  }

  const radicados = procesos.map(p => p.radicado)
  const allProcesos = await prisma.proceso.findMany({
    where: { radicado: { in: radicados } },
    select: { id: true, radicado: true, despachoActualId: true },
  })

  function getProc(radicado: string) {
    return allProcesos.find(p => p.radicado === radicado)!
  }

  const providenciasData = [
    { radicado: '27001-33-33-001-2023-00123-00', tipoId: tipoAutoPruebas, descripcion: 'Auto que decreta pruebas de oficio', diasTermino: 10 },
    { radicado: '27001-33-33-002-2023-00456-00', tipoId: tipoAutoAdmisorio, descripcion: 'Auto admisorio de la demanda', diasTermino: 5 },
    { radicado: '27001-33-33-003-2024-00189-00', tipoId: tipoAutoPruebas, descripcion: 'Fija fecha para audiencia de pruebas', diasTermino: 15 },
    { radicado: '27001-33-33-004-2024-00321-00', tipoId: tipoAutoTraslado, descripcion: 'Corre traslado para contestar', diasTermino: 3 },
    { radicado: '27001-33-33-006-2024-00234-00', tipoId: tipoAutoPruebas, descripcion: 'Auto que decreta pruebas solicitadas', diasTermino: 8 },
    { radicado: '27001-33-33-007-2023-00567-00', tipoId: tipoSentencia, descripcion: 'Fija fecha para lectura de sentencia', diasTermino: 4 },
    { radicado: '27001-33-33-008-2025-00111-00', tipoId: tipoAutoTraslado, descripcion: 'Traslado para alegar de conclusión', diasTermino: 2 },
    { radicado: '27001-33-33-009-2024-00987-00', tipoId: tipoAutoAdmisorio, descripcion: 'Admite demanda y ordena notificar', diasTermino: 5 },
  ]

  for (const prv of providenciasData) {
    const proc = getProc(prv.radicado)
    await prisma.providencia.create({
      data: {
        procesoId: proc.id,
        tipoProvidenciaId: prv.tipoId,
        fechaProvidencia: new Date('2026-07-05'),
        fechaNotificacion: null,
        descripcion: prv.descripcion,
      },
    })
    console.log(`  ✓ Providencia: ${prv.descripcion} (pendiente de notificar)`)
  }

  // Archivados → GRIS y no vigentes
  await prisma.proceso.updateMany({
    where: { etapaActualId: etapaArchivado },
    data: { colorEstado: 'GRIS', vigente: false },
  })

  console.log(`\n✅ ${procesos.length} procesos y ${providenciasData.length} providencias creados`)
  await prisma.$disconnect()
}

main()
