import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import descuentosRoutes from './routes/descuentos'
import categoriasRoutes from './routes/categorias'
import usuariosRoutes from './routes/usuarios'
import clientsRoutes from './routes/clients'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware de seguridad
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por ventana
})
app.use(limiter)

// Middleware de logging
app.use(morgan('combined'))

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rutas
app.use('/api/descuentos', descuentosRoutes)
app.use('/api/categorias', categoriasRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/clients', clientsRoutes)

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  })
})

// Middleware de manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  })
})

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
  console.log(`📱 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
  console.log(`🔗 API: http://localhost:${PORT}/api`)
})

export default app 