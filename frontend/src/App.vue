<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>agribnails</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn :to="{ name: 'home' }" variant="text">Inicio</v-btn>
      <v-btn :to="{ name: 'clientes' }" variant="text" v-if="isAuthenticated">Admin</v-btn>
      <v-btn :to="{ name: 'login' }" variant="text" v-if="!isAuthenticated">Ingresar</v-btn>
      <v-btn
        v-if="isAuthenticated"
        color="secondary"
        variant="flat"
        class="ml-2"
        @click="logout"
        prepend-icon="mdi-logout"
      >
        Cerrar sesión
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>

    <v-footer app color="primary" dark height="56" class="py-1">
      <v-container class="py-0">
        <v-row no-gutters align="center" justify="center">
          <v-col cols="12" md="4" class="text-center text-md-left text-body-2 mb-1 mb-md-0">
            Estamos en Nueva Córdoba
          </v-col>
          <v-col cols="12" md="4" class="text-center text-body-2 mb-1 mb-md-0">
            Turnos por
            <a href="https://www.instagram.com/agribnails/" target="_blank" rel="noopener" class="footer-link">
              <v-icon size="16" class="mr-1">mdi-instagram</v-icon>@agribnails
            </a>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { app } from './firebase'
const auth = useAuthStore()
const router = useRouter()
const isAuthenticated = ref(false)
onMounted(() => {
  onAuthStateChanged(getAuth(app), (u) => {
    isAuthenticated.value = !!u
    console.log('[App] onAuthStateChanged isAuthenticated =', isAuthenticated.value)
  })
})
const logout = async () => {
  await auth.logout()
  router.push({ name: 'home' })
}
</script>

<style>
#app { font-family: 'Roboto', sans-serif; }
.footer-link { color: #fff; text-decoration: none; }
.footer-link:hover { text-decoration: underline; }
</style> 