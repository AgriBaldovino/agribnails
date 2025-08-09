import express from 'express'
import { getDescuentos, getDescuentoById, createDescuento, updateDescuento, deleteDescuento } from '../controllers/descuentosController'

const router = express.Router()

// GET /api/descuentos - Obtener todos los descuentos
router.get('/', getDescuentos)

// GET /api/descuentos/:id - Obtener descuento por ID
router.get('/:id', getDescuentoById)

// POST /api/descuentos - Crear nuevo descuento
router.post('/', createDescuento)

// PUT /api/descuentos/:id - Actualizar descuento
router.put('/:id', updateDescuento)

// DELETE /api/descuentos/:id - Eliminar descuento
router.delete('/:id', deleteDescuento)

export default router 