import { Request, Response } from 'express'

export const getUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = [
      {
        id: '1',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@email.com',
        telefono: '+54 11 1234-5678',
        direccion: 'Av. Corrientes 1234, Buenos Aires',
        categoriasFavoritas: ['Electrónicos', 'Ropa']
      }
    ]

    res.json({
      success: true,
      data: usuarios,
      message: 'Usuarios obtenidos exitosamente'
    })
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuarios'
    })
  }
}

export const getUsuarioById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    // Implementar lógica real aquí
    res.json({
      success: true,
      data: { id, nombre: 'Usuario Ejemplo' },
      message: 'Usuario obtenido exitosamente'
    })
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuario'
    })
  }
}

export const getPerfil = async (req: Request, res: Response) => {
  try {
    // En una implementación real, obtendrías el usuario del token JWT
    const perfil = {
      id: '1',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@email.com',
      telefono: '+54 11 1234-5678',
      direccion: 'Av. Corrientes 1234, Buenos Aires',
      categoriasFavoritas: ['Electrónicos', 'Ropa']
    }

    res.json({
      success: true,
      data: perfil,
      message: 'Perfil obtenido exitosamente'
    })
  } catch (error) {
    console.error('Error al obtener perfil:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener perfil'
    })
  }
}

export const createUsuario = async (req: Request, res: Response) => {
  try {
    const usuarioData = req.body
    res.status(201).json({
      success: true,
      data: { id: Date.now().toString(), ...usuarioData },
      message: 'Usuario creado exitosamente'
    })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    res.status(500).json({
      success: false,
      error: 'Error al crear usuario'
    })
  }
}

export const updateUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const usuarioData = req.body
    res.json({
      success: true,
      data: { id, ...usuarioData },
      message: 'Usuario actualizado exitosamente'
    })
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar usuario'
    })
  }
}

export const deleteUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    res.status(500).json({
      success: false,
      error: 'Error al eliminar usuario'
    })
  }
} 