import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.consecutivo.count()
  if (existing > 0) {
    console.log(`Ya existen ${existing} consecutivos. Omitiendo seed.`)
    return
  }

  const data = Array.from({ length: 3500 }, (_, i) => ({
    numero: String(i + 1).padStart(4, '0'),
  }))

  await prisma.consecutivo.createMany({ data })
  console.log(`✅ ${data.length} consecutivos creados (0001–3500)`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
