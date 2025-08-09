export interface Descuento {
  id: string
  titulo: string
  descripcion: string
  porcentaje: number
  categoria: string
  fechaInicio: string
  fechaVencimiento: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDescuentoRequest {
  titulo: string
  descripcion: string
  porcentaje: number
  categoria: string
  fechaInicio: string
  fechaVencimiento: string
  activo?: boolean
}

export interface UpdateDescuentoRequest {
  titulo?: string
  descripcion?: string
  porcentaje?: number
  categoria?: string
  fechaInicio?: string
  fechaVencimiento?: string
  activo?: boolean
} 