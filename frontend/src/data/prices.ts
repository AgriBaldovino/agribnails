export interface PriceItem {
  label: string
  price: number
}

export const PRICE_CORE: PriceItem[] = [
  { label: 'Semipermanente', price: 15000 },
  { label: 'Kapping', price: 17000 },
  { label: 'Softgel', price: 18000 },
]

export const PRICE_ADDONS: PriceItem[] = [
  { label: 'Diseño', price: 2000 },
  { label: 'Francesita', price: 3000 },
]

export const PRICE_REMOVAL: PriceItem[] = [
  { label: 'Retirado otra colega (Semipermanente/Kapping)', price: 3000 },
  { label: 'Retirado otra colega (Softgel)', price: 4000 },
]


