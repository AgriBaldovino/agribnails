import { Request, Response } from 'express'

export const getCategorias = async (req: Request, res: Response) => {
  try {
    const categorias = [
      {
        id: '1',
        nombre: 'Electrónicos',
        descripcion: 'Smartphones, laptops, tablets y más',
        icono: 'mdi-laptop',
        color: 'primary',
        cantidad: 15
      },
      {
        id: '2',
        nombre: 'Ropa',
        descripcion: 'Ropa para hombres, mujeres y niños',
        icono: 'mdi-hanger',
        color: 'success',
        cantidad: 25
      },
      {
        id: '3',
        nombre: 'Hogar',
        descripcion: 'Muebles, decoración y electrodomésticos',
        icono: 'mdi-home',
        color: 'info',
        cantidad: 20
      },
      {
        id: '4',
        nombre: 'Deportes',
        descripcion: 'Equipamiento y ropa deportiva',
        icono: 'mdi-bike',
        color: 'warning',
        cantidad: 12
      }
    ]

    res.json({
      success: true,
      data: categorias,
      message: 'Categorías obtenidas exitosamente'
    })
  } catch (error) {
    console.error('Error al obtener categorías:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener categorías'
    })
  }
}

export const getCategoriaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    // Implementar lógica real aquí
    res.json({
      success: true,
      data: { id, nombre: 'Categoría Ejemplo' },
      message: 'Categoría obtenida exitosamente'
    })
  } catch (error) {
    console.error('Error al obtener categoría:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener categoría'
    })
  }
}

export const createCategoria = async (req: Request, res: Response) => {
  try {
    const categoriaData = req.body
    res.status(201).json({
      success: true,
      data: { id: Date.now().toString(), ...categoriaData },
      message: 'Categoría creada exitosamente'
    })
  } catch (error) {
    console.error('Error al crear categoría:', error)
    res.status(500).json({
      success: false,
      error: 'Error al crear categoría'
    })
  }
}

export const updateCategoria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const categoriaData = req.body
    res.json({
      success: true,
      data: { id, ...categoriaData },
      message: 'Categoría actualizada exitosamente'
    })
  } catch (error) {
    console.error('Error al actualizar categoría:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar categoría'
    })
  }
}

export const deleteCategoria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar categoría:', error)
    res.status(500).json({
      success: false,
      error: 'Error al eliminar categoría'
    })
  }
} 