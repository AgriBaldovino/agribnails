<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card>
          <v-card-title class="text-h5">Ingreso de administradora</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="doLogin">
              <v-text-field v-model="email" label="Email" type="email" variant="outlined" required />
              <v-text-field v-model="password" label="Contraseña" type="password" variant="outlined" required />
            </v-form>
            <v-alert v-if="error" type="error" variant="tonal" class="mt-2">{{ error }}</v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" :loading="loading" @click="doLogin">Ingresar</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function doLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/clientes')
  } catch (e: any) {
    error.value = e?.message || 'Error de autenticación'
  } finally {
    loading.value = false
  }
}
</script>


