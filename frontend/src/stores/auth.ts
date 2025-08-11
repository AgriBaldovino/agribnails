import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence, type User } from 'firebase/auth'
import { app } from '../firebase'

const auth = getAuth(app)

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isInitialized = ref(false)

  // Solo un listener de auth state para evitar conflictos
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
    isInitialized.value = true
  })

  const isAuthenticated = computed(() => !!currentUser.value)
  const email = computed(() => currentUser.value?.email || '')

  async function login(email: string, password: string) {
    try {
      // Forzar persistencia local para que la sesión se mantenga
      await setPersistence(auth, browserLocalPersistence)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Error en login:', error)
      throw error
    }
  }

  async function logout() {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error en logout:', error)
      throw error
    }
  }

  return {
    currentUser,
    isAuthenticated,
    isInitialized,
    email,
    login,
    logout,
  }
})


