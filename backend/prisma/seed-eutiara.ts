import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'ecasasa@cendoj.ramajudicial.gov.co' } })
  if (existing) {
    console.log('Eutiara ya existe. Omitiendo.')
    return
  }

  const despachos = await prisma.despacho.findMany()
  const dIds = despachos.filter(d => ['D001', 'D002', 'D003', 'D004', 'D005'].includes(d.codigo)).map(d => d.id)

  const hash = await bcrypt.hash('Eutiara.123', 10)

  const user = await prisma.user.create({
    data: {
      nombre: 'Eutiara Madoly Casas Arboleda',
      email: 'ecasasa@cendoj.ramajudicial.gov.co',
      passwordHash: hash,
      rol: 'OFICIAL_MAYOR',
      cargo: 'Oficial Mayor',
      despachos: { create: dIds.map(despachoId => ({ despachoId })) },
    },
  })

  console.log(`✓ ${user.nombre} (${user.rol})`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
