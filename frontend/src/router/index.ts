import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { app } from '@/firebase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
    { path: '/clientes', name: 'clientes', component: () => import('@/views/ClientesView.vue'), meta: { requiresAuth: true } },
    { path: '/clientes/:id', name: 'cliente-detalle', component: () => import('@/views/ClienteDetalleView.vue') },
  ]
})

let authInitPromise: Promise<unknown> | null = null
function waitForAuthInit() {
  if (authInitPromise) return authInitPromise
  const auth = getAuth(app)
  authInitPromise = new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, () => {
      unsub()
      resolve(null)
    })
  })
  return authInitPromise
}

router.beforeEach(async (to) => {
  await waitForAuthInit()
  const auth = getAuth(app)
  const isAuthed = !!auth.currentUser
  if (to.meta.requiresAuth && !isAuthed) {
    return { name: 'login' }
  }
  return true
})

export default router 