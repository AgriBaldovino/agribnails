import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence, type User } from 'firebase/auth'
import { app } from '../firebase'

const auth = getAuth(app)

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(auth.currentUser)

  onAuthStateChanged(auth, (u) => {
    currentUser.value = u
  })

  const isAuthenticated = computed(() => !!currentUser.value)
  const email = computed(() => currentUser.value?.email || '')

  async function login(email: string, password: string) {
    // Forzar persistencia local para que la sesión se mantenga y los guards vean el estado
    await setPersistence(auth, browserLocalPersistence)
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    await signOut(auth)
  }

  return {
    currentUser,
    isAuthenticated,
    email,
    login,
    logout,
  }
})


