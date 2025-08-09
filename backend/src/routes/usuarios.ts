import express from 'express'
import { getUsuarios, getUsuarioById, createUsuario, updateUsuario, deleteUsuario, getPerfil } from '../controllers/usuariosController'

const router = express.Router()

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', getUsuarios)

// GET /api/usuarios/perfil - Obtener perfil del usuario actual
router.get('/perfil', getPerfil)

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', getUsuarioById)

// POST /api/usuarios - Crear nuevo usuario
router.post('/', createUsuario)

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', updateUsuario)

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', deleteUsuario)

export default router 