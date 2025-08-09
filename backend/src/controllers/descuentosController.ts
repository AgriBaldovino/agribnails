import { Request, Response } from 'express'
import { DescuentoService } from '../services/descuentoService'

const descuentoService = new DescuentoService()

export const getDescuentos = async (req: Request, res: Response) => {
  try {
    const descuentos = await descuentoService.getAllDescuentos()
    res.json({
      success: true,
      data: descuentos,
      message: 'Descuentos obtenidos exitosamente'
    })
  } catch (error) {
    console.error('Error al obtener descuentos:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener descuentos'
    })
  }
}

export const getDescuentoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const descuento = await descuentoService.getDescuentoById(id)
    
    if (!descuento) {
      return res.status(404).json({
        success: false,
        error: 'Descuento no encontrado'
      })
    }
    
    res.json({
      success: true,
      data: descuento,
      message: 'Descuento obtenido exitosamente'
    })
  } catch (error) {
    console.error('Error al obtener descuento:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener descuento'
    })
  }
}

export const createDescuento = async (req: Request, res: Response) => {
  try {
    const descuentoData = req.body
    const nuevoDescuento = await descuentoService.createDescuento(descuentoData)
    
    res.status(201).json({
      success: true,
      data: nuevoDescuento,
      message: 'Descuento creado exitosamente'
    })
  } catch (error) {
    console.error('Error al crear descuento:', error)
    res.status(500).json({
      success: false,
      error: 'Error al crear descuento'
    })
  }
}

export const updateDescuento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const descuentoData = req.body
    const descuentoActualizado = await descuentoService.updateDescuento(id, descuentoData)
    
    if (!descuentoActualizado) {
      return res.status(404).json({
        success: false,
        error: 'Descuento no encontrado'
      })
    }
    
    res.json({
      success: true,
      data: descuentoActualizado,
      message: 'Descuento actualizado exitosamente'
    })
  } catch (error) {
    console.error('Error al actualizar descuento:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar descuento'
    })
  }
}

export const deleteDescuento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const eliminado = await descuentoService.deleteDescuento(id)
    
    if (!eliminado) {
      return res.status(404).json({
        success: false,
        error: 'Descuento no encontrado'
      })
    }
    
    res.json({
      success: true,
      message: 'Descuento eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar descuento:', error)
    res.status(500).json({
      success: false,
      error: 'Error al eliminar descuento'
    })
  }
} 