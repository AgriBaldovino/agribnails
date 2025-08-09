export type ServiceKey = 'semipermanente' | 'kapping' | 'softgel'

export interface ServiceDef {
  key: ServiceKey
  name: string
  maxDaysUntilNextVisit: number
}

export interface VisitRecord {
  id: string
  dateISO: string
  serviceKey: ServiceKey
}

export interface ClientRecord {
  id: string
  firstName: string
  lastName: string
  dni: string
  visits: VisitRecord[]
  createdAtISO: string
  updatedAtISO: string
}

export interface DiscountStatus {
  totalVisits: number
  visitsSinceLastDiscount: number
  nextVisitInCycle: number
  lastServiceKey: ServiceKey | null
  requiredMaxDays: number | null
  nextDeadlineDateISO: string | null
}