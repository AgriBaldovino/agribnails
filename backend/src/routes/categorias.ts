import express from 'express'
import { getCategorias, getCategoriaById, createCategoria, updateCategoria, deleteCategoria } from '../controllers/categoriasController'

const router = express.Router()

// GET /api/categorias - Obtener todas las categorías
router.get('/', getCategorias)

// GET /api/categorias/:id - Obtener categoría por ID
router.get('/:id', getCategoriaById)

// POST /api/categorias - Crear nueva categoría
router.post('/', createCategoria)

// PUT /api/categorias/:id - Actualizar categoría
router.put('/:id', updateCategoria)

// DELETE /api/categorias/:id - Eliminar categoría
router.delete('/:id', deleteCategoria)

export default router 