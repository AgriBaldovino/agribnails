export type ServiceKey = 'semipermanente' | 'kapping' | 'softgel'

export interface VisitRecord {
  id: string
  dateISO: string
  serviceKey: ServiceKey
}

export interface ClientRecord {
  id: string
  firstName: string
  lastName: string
  visits: VisitRecord[]
  createdAtISO: string
  updatedAtISO: string
}


