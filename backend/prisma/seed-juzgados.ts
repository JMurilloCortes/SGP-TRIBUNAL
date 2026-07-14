import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const juzgados = [
  { codigo: 'J001', nombre: 'Juzgado Administrativo No. 1 de Quibdó' },
  { codigo: 'J002', nombre: 'Juzgado Administrativo No. 2 de Quibdó' },
  { codigo: 'J003', nombre: 'Juzgado Administrativo No. 3 de Quibdó' },
  { codigo: 'J004', nombre: 'Juzgado Administrativo No. 4 de Quibdó' },
  { codigo: 'J005', nombre: 'Juzgado Administrativo No. 5 de Quibdó' },
  { codigo: 'J006', nombre: 'Juzgado Administrativo No. 6 de Quibdó' },
  { codigo: 'J007', nombre: 'Juzgado Administrativo No. 7 de Quibdó' },
  { codigo: 'J008', nombre: 'Juzgado Administrativo No. 8 de Quibdó' },
  { codigo: 'J009', nombre: 'Juzgado Administrativo No. 9 de Quibdó' },
]

async function main() {
  const existing = await prisma.juzgado.count()
  if (existing > 0) {
    console.log(`Ya existen ${existing} juzgados. Omitiendo seed.`)
    return
  }

  for (const j of juzgados) {
    await prisma.juzgado.create({ data: j })
  }

  console.log(`✓ ${juzgados.length} juzgados creados`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
