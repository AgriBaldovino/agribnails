import express from 'express'
import { EmailService } from '../services/emailService'

const router = express.Router()

// Enviar notificación al admin cuando se crea una reserva
router.post('/admin', async (req, res) => {
  try {
    const notificationData = req.body
    
    // Validar datos requeridos
    if (!notificationData.nombreCliente || !notificationData.fecha || !notificationData.hora) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos requeridos para la notificación' 
      })
    }

    const success = await EmailService.sendAdminNotification(notificationData)
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Notificación enviada exitosamente al admin' 
      })
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Error enviando notificación al admin' 
      })
    }
  } catch (error) {
    console.error('❌ Error en endpoint de notificación admin:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    })
  }
})

// Enviar confirmación al cliente
router.post('/client', async (req, res) => {
  try {
    const notificationData = req.body
    
    // Validar datos requeridos
    if (!notificationData.nombreCliente || !notificationData.fecha || !notificationData.hora || !notificationData.emailCliente) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos requeridos para la confirmación del cliente' 
      })
    }

    const success = await EmailService.sendClientConfirmation(notificationData)
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Confirmación enviada exitosamente al cliente' 
      })
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Error enviando confirmación al cliente' 
      })
    }
  } catch (error) {
    console.error('❌ Error en endpoint de confirmación cliente:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    })
  }
})

// Enviar ambas notificaciones (admin + cliente)
router.post('/both', async (req, res) => {
  try {
    const notificationData = req.body
    
    // Validar datos requeridos
    if (!notificationData.nombreCliente || !notificationData.fecha || !notificationData.hora) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos requeridos para las notificaciones' 
      })
    }

    // Enviar notificación al admin
    const adminSuccess = await EmailService.sendAdminNotification(notificationData)
    
    // Enviar confirmación al cliente (si tiene email)
    let clientSuccess = false
    if (notificationData.emailCliente) {
      clientSuccess = await EmailService.sendClientConfirmation(notificationData)
    }

    const results = {
      admin: adminSuccess,
      client: clientSuccess,
      hasClientEmail: !!notificationData.emailCliente
    }

    if (adminSuccess) {
      res.json({ 
        success: true, 
        message: 'Notificaciones enviadas',
        results
      })
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Error enviando notificaciones',
        results
      })
    }
  } catch (error) {
    console.error('❌ Error en endpoint de notificaciones múltiples:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    })
  }
})

export default router
