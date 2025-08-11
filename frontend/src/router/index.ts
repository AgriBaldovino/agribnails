import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { getAuth } from 'firebase/auth'
import { app } from '@/firebase'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/turnos', name: 'turnos', component: () => import('@/views/TurnosView.vue') },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
    { path: '/clientes', name: 'clientes', component: () => import('@/views/ClientesView.vue'), meta: { requiresAuth: true } },
    { path: '/clientes/:id', name: 'cliente-detalle', component: () => import('@/views/ClienteDetalleView.vue') },
    { path: '/admin-turnos', name: 'admin-turnos', component: () => import('@/views/AdminTurnosView.vue'), meta: { requiresAuth: true } },
    { path: '/admin-reservas', name: 'admin-reservas', component: () => import('@/views/AdminReservasView.vue'), meta: { requiresAuth: true } },
  ]
})

router.beforeEach(async (to, from, next) => {
  try {
    const auth = getAuth(app)
    
    // Si la ruta requiere autenticación, verificar el estado actual
    if (to.meta.requiresAuth) {
      if (!auth.currentUser) {
        // Si no hay usuario actual, redirigir al login
        next({ name: 'login' })
        return
      }
    }
    
    // Continuar con la navegación
    next()
  } catch (error) {
    console.error('Router guard error:', error)
    // En caso de error, permitir la navegación
    next()
  }
})

export default router 