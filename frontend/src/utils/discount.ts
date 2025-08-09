import { serviceByKey } from '@/data/services'
import type { VisitRecord, DiscountStatus, ServiceKey } from '@/types'

const parseLocalDate = (dateStr: string) => {
  // Soporta 'YYYY-MM-DD' (local) o ISO completo
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, (m || 1) - 1, d || 1)
  }
  return new Date(dateStr)
}

const toDate = (s: string) => parseLocalDate(s)
const addDays = (dateStr: string, days: number) => {
  const d = toDate(dateStr)
  d.setDate(d.getDate() + days)
  // Devolver como 'YYYY-MM-DD' para evitar problemas de zona horaria
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${da}`
}

export function computeDiscountStatus(visits: VisitRecord[]): DiscountStatus {
  // En este modelo, todas las visitas consideran servicios válidos (sin 'retiro')
  const totalVisits = visits.length
  const visitsSinceLastDiscount = totalVisits % 3
  const nextVisitInCycle = visitsSinceLastDiscount === 0 ? 3 : 3 - visitsSinceLastDiscount

  let lastServiceKey: DiscountStatus['lastServiceKey'] = null
  let requiredMaxDays: DiscountStatus['requiredMaxDays'] = null
  let nextDeadlineDateISO: DiscountStatus['nextDeadlineDateISO'] = null

  if (totalVisits > 0) {
    const last = visits[totalVisits - 1]
    lastServiceKey = last.serviceKey
    const service = serviceByKey(last.serviceKey)
    if (service) {
      requiredMaxDays = service.maxDaysUntilNextVisit
      nextDeadlineDateISO = addDays(last.dateISO, service.maxDaysUntilNextVisit)
    }
  }

  return {
    totalVisits,
    visitsSinceLastDiscount,
    nextVisitInCycle,
    lastServiceKey,
    requiredMaxDays,
    nextDeadlineDateISO,
  }
}

export function formatDate(iso?: string | null) {
  if (!iso) return '-'
  const d = toDate(iso)
  return d.toLocaleDateString()
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// Calcula descuento por visita (turnos 3, 6, 9 ...) si cumple intervalos <= max por servicio previo
export function computeVisitDiscounts(visits: VisitRecord[]): Record<string, { turnNumberValid: number, counted: boolean, eligible: boolean, percent: number, reason: string }>{
  const result: Record<string, { turnNumberValid: number, counted: boolean, eligible: boolean, percent: number, reason: string }> = {}
  if (visits.length === 0) return result

  const sorted = [...visits].sort((a, b) => toDate(a.dateISO).getTime() - toDate(b.dateISO).getTime())

  let validCount = 0

  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i]
    let counted = true
    let reason = 'OK'

    if (i === 0) {
      validCount = 1
    } else {
      const prev = sorted[i - 1]
      const sPrev = serviceByKey(prev.serviceKey as ServiceKey)
      const diffDays = Math.floor((toDate(curr.dateISO).getTime() - toDate(prev.dateISO).getTime()) / (1000 * 60 * 60 * 24))
      const limit = sPrev?.maxDaysUntilNextVisit ?? Number.POSITIVE_INFINITY
      if (diffDays <= limit) {
        validCount += 1
      } else {
        counted = false
        reason = `${diffDays}d > ${limit}d máx (${sPrev?.name || prev.serviceKey})`
      }
    }

    let eligible = false
    let percent = 0
    if (counted && validCount % 3 === 0) {
      const k = Math.floor(validCount / 3)
      if (k === 1) percent = 10
      else if (k === 2) percent = 20
      else percent = k === 3 ? 30 : 20
      eligible = true
    }

    result[curr.id] = { turnNumberValid: validCount, counted, eligible, percent, reason }
  }

  return result
}