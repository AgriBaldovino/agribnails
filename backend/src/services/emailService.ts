import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

export interface EmailNotificationData {
  nombreCliente: string
  apellidoCliente: string
  fecha: string
  hora: string
  servicio: string
  dni: string
  emailCliente?: string
}

export class EmailService {
  private static transporter: nodemailer.Transporter

  private static async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      })
    }
    return this.transporter
  }

  static async sendAdminNotification(data: EmailNotificationData): Promise<boolean> {
    try {
      const transporter = await this.getTransporter()
      const adminEmail = process.env.ADMIN_EMAIL

      if (!adminEmail) {
        console.error('❌ Variable ADMIN_EMAIL no configurada')
        return false
      }

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎉 NUEVA RESERVA CONFIRMADA</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">📋 Detalles de la Reserva</h2>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div style="background: #e3f2fd; padding: 15px; border-radius: 6px;">
                  <strong style="color: #1976d2;">👤 Cliente:</strong><br>
                  ${data.nombreCliente} ${data.apellidoCliente}
                </div>
                
                <div style="background: #e8f5e8; padding: 15px; border-radius: 6px;">
                  <strong style="color: #388e3c;">🆔 DNI:</strong><br>
                  ${data.dni}
                </div>
                
                <div style="background: #fff3e0; padding: 15px; border-radius: 6px;">
                  <strong style="color: #f57c00;">📅 Fecha:</strong><br>
                  ${new Date(data.fecha).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                
                <div style="background: #fce4ec; padding: 15px; border-radius: 6px;">
                  <strong style="color: #c2185b;">🕐 Hora:</strong><br>
                  ${data.hora}
                </div>
              </div>
              
              <div style="background: #f3e5f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <strong style="color: #7b1fa2;">💇‍♀️ Servicio:</strong><br>
                ${data.servicio}
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <div style="background: #4caf50; color: white; padding: 12px 30px; border-radius: 25px; display: inline-block; font-weight: bold;">
                  ✅ RESERVA CONFIRMADA
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
              <p>Este email fue enviado automáticamente por el sistema de reservas</p>
              <p>📧 ${adminEmail} | 📱 Sistema de Gestión</p>
            </div>
          </div>
        </div>
      `

      const mailOptions = {
        from: `"Sistema de Reservas" <${process.env.GMAIL_USER}>`,
        to: adminEmail,
        subject: `🎯 Nueva Reserva - ${data.nombreCliente} ${data.apellidoCliente}`,
        html: htmlContent
      }

      const info = await transporter.sendMail(mailOptions)
      console.log('✅ Email de notificación enviado al admin:', info.messageId)
      return true

    } catch (error) {
      console.error('❌ Error enviando email de notificación:', error)
      return false
    }
  }

  static async sendClientConfirmation(data: EmailNotificationData): Promise<boolean> {
    try {
      if (!data.emailCliente) {
        console.log('⚠️ No hay email del cliente para enviar confirmación')
        return false
      }

      const transporter = await this.getTransporter()

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎉 ¡RESERVA CONFIRMADA!</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Hola ${data.nombreCliente} 👋</h2>
              
              <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Tu turno ha sido reservado exitosamente. Aquí tienes todos los detalles:
              </p>
              
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
                <h3 style="color: #2e7d32; margin-top: 0;">📅 Detalles del Turno</h3>
                <p><strong>Fecha:</strong> ${new Date(data.fecha).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                <p><strong>Hora:</strong> ${data.hora}</p>
                <p><strong>Servicio:</strong> ${data.servicio}</p>
              </div>
              
              <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
                <h3 style="color: #f57c00; margin-top: 0;">⚠️ Información Importante</h3>
                <ul style="color: #555; line-height: 1.6;">
                  <li>Llega <strong>10 minutos antes</strong> de tu horario</li>
                  <li>Trae tu DNI para la verificación</li>
                  <li>Si necesitas cancelar, hazlo con al menos 24h de anticipación</li>
                </ul>
              </div>
              
              <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
                <h3 style="color: #1976d2; margin-top: 0;">📍 Ubicación</h3>
                <p style="color: #555; margin-bottom: 10px;">
                  <strong>Dirección del local:</strong><br>
                  [Tu dirección aquí]
                </p>
                <p style="color: #555; margin-bottom: 10px;">
                  <strong>Contacto:</strong><br>
                  📱 [Tu número de teléfono]<br>
                  📧 [Tu email de contacto]
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <div style="background: #4caf50; color: white; padding: 15px 40px; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 18px;">
                  ✅ TURNO CONFIRMADO
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
              <p>¡Gracias por elegirnos! 😊</p>
              <p>📧 ${process.env.GMAIL_USER} | 📱 Sistema de Gestión</p>
            </div>
          </div>
        </div>
      `

      const mailOptions = {
        from: `"Tu Negocio" <${process.env.GMAIL_USER}>`,
        to: data.emailCliente,
        subject: `✅ Confirmación de Reserva - ${new Date(data.fecha).toLocaleDateString('es-ES')}`,
        html: htmlContent
      }

      const info = await transporter.sendMail(mailOptions)
      console.log('✅ Email de confirmación enviado al cliente:', info.messageId)
      return true

    } catch (error) {
      console.error('❌ Error enviando email de confirmación al cliente:', error)
      return false
    }
  }
}
