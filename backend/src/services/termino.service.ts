import { ColorEstado } from '@prisma/client'

function isBusinessDay(date: Date): boolean {
  const day = date.getDay()
  return day !== 0 && day !== 6
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
