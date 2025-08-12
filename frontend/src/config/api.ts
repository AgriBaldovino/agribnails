// Configuración de URLs del backend
const isDevelopment = import.meta.env.DEV

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000'  // Desarrollo local
  : 'https://tu-backend.vercel.app'  // Producción (cambiar por tu URL real)

export const API_ENDPOINTS = {
  notifications: {
    admin: `${API_BASE_URL}/api/notifications/admin`,
    client: `${API_BASE_URL}/api/notifications/client`,
    both: `${API_BASE_URL}/api/notifications/both`
  }
}
