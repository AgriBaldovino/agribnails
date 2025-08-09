import type { ServiceDef } from '@/types'

export const SERVICES: ServiceDef[] = [
  { key: 'semipermanente', name: 'Esmaltado Semipermanente', maxDaysUntilNextVisit: 15 },
  { key: 'kapping', name: 'Kapping', maxDaysUntilNextVisit: 21 },
  { key: 'softgel', name: 'Softgel', maxDaysUntilNextVisit: 30 },
]

export const serviceByKey = (key: string | undefined | null) => SERVICES.find(s => s.key === key)