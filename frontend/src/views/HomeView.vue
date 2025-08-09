<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card>
          <v-card-title class="text-h5">agribnails</v-card-title>
          <v-card-subtitle>Consulta de descuentos por DNI</v-card-subtitle>
          <v-card-text>
            <v-form @submit.prevent="consultar">
              <v-text-field
                v-model="dni"
                label="Ingresá tu DNI"
                variant="outlined"
                required
              />
            </v-form>
            <v-alert v-if="error" type="error" variant="tonal" class="mt-2">{{ error }}</v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" @click="consultar" :disabled="!dni">Consultar</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useClientsStore } from '../stores/clients'

const router = useRouter()
const store = useClientsStore()
const dni = ref('')
const error = ref('')

function consultar() {
  error.value = ''
  store.findOrFetchByDni(dni.value).then((c) => {
    if (!c) {
      error.value = 'No encontramos una clienta con ese DNI'
      return
    }
    router.push(`/clientes/${c.id}`)
  })
}
</script>