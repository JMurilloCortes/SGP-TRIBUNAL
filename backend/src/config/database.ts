import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

prisma.$executeRawUnsafe('PRAGMA journal_mode=WAL')
prisma.$executeRawUnsafe('PRAGMA busy_timeout=5000')
