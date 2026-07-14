import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.user.count({ where: { email: 'jmurillc@cendoj.ramajudicial.gov.co' } })
  if (existing > 0) {
    console.log('Usuarios ya existen. Omitiendo seed.')
    return
  }

  const despachos = await prisma.despacho.findMany()
  const juzgados = await prisma.juzgado.findMany()

  const dByCode = new Map(despachos.map(d => [d.codigo, d.id]))
  const jByCode = new Map(juzgados.map(j => [j.codigo, j.id]))

  const hash = (pw: string) => bcrypt.hash(pw, 10)

  const users = [
    {
      nombre: 'Jerry Alberto Murillo Cortes',
      email: 'jmurillc@cendoj.ramajudicial.gov.co',
      password: 'Jerry.123',
      rol: 'ADMIN' as const,
      cargo: 'Administrador',
      despachoCodigos: ['D001', 'D002', 'D003', 'D004', 'D005'],
      juzgadoCodigos: [] as string[],
    },
    {
      nombre: 'Ettienne Cordoba Mosquera',
      email: 'ecordobm@cendoj.ramajudicial.gov.co',
      password: 'Attienne.123',
      rol: 'CONTADOR_LIQUIDADOR' as const,
      cargo: 'Contador Liquidador Grado 17',
      despachoCodigos: ['D001', 'D002', 'D003', 'D004', 'D005'],
      juzgadoCodigos: [] as string[],
    },
    {
      nombre: 'Martha Irayda Murillo Delgado',
      email: 'mmurilld@cendoj.ramajudicial.gov.co',
      password: 'Martha.123',
      rol: 'PROFESIONAL' as const,
      cargo: 'Profesional Universitario Grado 12',
      despachoCodigos: [] as string[],
      juzgadoCodigos: ['J001', 'J002', 'J003', 'J004', 'J005', 'J006', 'J007', 'J008', 'J009'],
    },
    {
      nombre: 'Almir Chaverra Ampudia',
      email: 'achavera@cendoj.ramajudicial.gov.co',
      password: 'Almir.123',
      rol: 'SECRETARIO' as const,
      cargo: 'Secretario General',
      despachoCodigos: ['D001', 'D002', 'D003', 'D004', 'D005'],
      juzgadoCodigos: [] as string[],
    },
  ]

  for (const u of users) {
    const passwordHash = await hash(u.password)
    const user = await prisma.user.create({
      data: {
        nombre: u.nombre,
        email: u.email,
        passwordHash,
        rol: u.rol,
        cargo: u.cargo,
        despachos: {
          create: u.despachoCodigos
            .map(codigo => dByCode.get(codigo))
            .filter((id): id is number => id !== undefined)
            .map(despachoId => ({ despachoId })),
        },
        juzgados: {
          create: u.juzgadoCodigos
            .map(codigo => jByCode.get(codigo))
            .filter((id): id is number => id !== undefined)
            .map(juzgadoId => ({ juzgadoId })),
        },
      },
    })
    console.log(`✓ ${user.nombre} (${user.rol})`)
  }

  console.log(`\n✓ ${users.length} usuarios creados`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
