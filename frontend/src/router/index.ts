import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'

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

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router 