import { ColorEstado } from '@prisma/client'

const COLOMBIAN_HOLIDAYS: Record<number, string[]> = {}

function getHolidays(year: number): Set<string> {
  if (COLOMBIAN_HOLIDAYS[year]) return new Set(COLOMBIAN_HOLIDAYS[year])

  const holidays: string[] = [
    `${year}-01-01`,
    `${year}-05-01`,
    `${year}-07-20`,
    `${year}-08-07`,
    `${year}-12-08`,
    `${year}-12-25`,
  ]

  const easter = getEaster(year)
  holidays.push(formatDate(addDays(easter, -3)))
  holidays.push(formatDate(easter))
  holidays.push(formatDate(addDays(easter, 39)))
  holidays.push(formatDate(addDays(easter, 60)))

  const ascension = addDays(easter, 43)
  const corpus = addDays(easter, 60)
  const santisimaTrinidad = addDays(easter, 68)

  holidays.push(formatDate(ascension))
  holidays.push(formatDate(corpus))
  holidays.push(formatDate(santisimaTrinidad))

  const observed: string[] = []
  for (const h of holidays) {
    const d = new Date(h + 'T12:00:00')
    const dow = d.getDay()
    if (dow === 0) {
      observed.push(formatDate(addDays(d, 1)))
    } else if (dow === 6) {
      observed.push(formatDate(addDays(d, 2)))
    }
  }

  const all = [...holidays, ...observed]
  COLOMBIAN_HOLIDAYS[year] = all
  return new Set(all)
}

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(d: Date, days: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + days)
  return r
}

function getEaster(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month, day)
}

function isBusinessDay(date: Date): boolean {
  const dow = date.getDay()
  if (dow === 0 || dow === 6) return false

  const year = date.getFullYear()
  const holidays = getHolidays(year)
  const nextYear = getHolidays(year + 1)

  const dateStr = formatDate(date)
  return !holidays.has(dateStr) && !nextYear.has(dateStr)
}

export function addBusinessDays(startDate: Date, days: number): Date {
  const result = new Date(startDate)
  let added = 0
  while (added < days) {
    result.setDate(result.getDate() + 1)
    if (isBusinessDay(result)) {
      added++
    }
  }
  return result
}

export function getBusinessDaysBetween(start: Date, end: Date): number {
  let count = 0
  const current = new Date(start)
  while (current <= end) {
    if (isBusinessDay(current)) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }
  return count
}

export function calcularColor(fechaVencimiento: Date): ColorEstado {
  const now = new Date()
  const diasRestantes = getBusinessDaysBetween(now, fechaVencimiento)

  if (now > fechaVencimiento) return ColorEstado.ROJO
  if (diasRestantes <= 2) return ColorEstado.NARANJA
  if (diasRestantes <= 5) return ColorEstado.AMARILLO
  return ColorEstado.VERDE
}
