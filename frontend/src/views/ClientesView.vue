<template>
  <v-container>
    <v-snackbar v-model="saved" color="success" timeout="2500" location="top">
      Precios guardados correctamente
    </v-snackbar>
    <v-alert
      v-if="$route.query.msg === 'client_deleted'"
      type="success"
      variant="tonal"
      class="mb-4"
    >
      Clienta eliminada exitosamente
    </v-alert>
    <v-row class="align-center mb-2">
      <v-col cols="12" md="6">
        <h2 class="text-h4">Clientas</h2>
      </v-col>
      <v-col cols="12" md="6" class="text-right d-flex align-center justify-end">
        <v-btn
          :to="{ name: 'admin-turnos' }"
          color="primary"
          size="default"
          prepend-icon="mdi-calendar-plus"
          class="mr-2"
          variant="flat"
        >
          Administrar Turnos
        </v-btn>
        <v-btn
          :to="{ name: 'admin-reservas' }"
          color="secondary"
          size="default"
          prepend-icon="mdi-calendar-check"
          class="mr-2"
          variant="flat"
        >
          Gestión de Reservas
        </v-btn>
        <v-dialog v-model="showNew" max-width="500">
          <template #activator="{ props }">
            <v-btn color="primary" size="default" variant="flat" v-bind="props" class="mr-2">Nueva clienta</v-btn>
          </template>
          <v-card>
            <v-card-title>Nueva clienta</v-card-title>
            <v-card-text>
            <v-form @submit.prevent="createClient">
                <v-text-field v-model="firstName" label="Nombre" required variant="outlined" />
                <v-text-field v-model="lastName" label="Apellido" required variant="outlined" />
              <v-text-field v-model="dni" label="DNI" required variant="outlined" />
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn variant="text" @click="showNew = false">Cancelar</v-btn>
              <v-btn color="primary" @click="createClient" :disabled="!firstName || !lastName || !dni">Guardar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="showPrices" max-width="1200">
          <template #activator="{ props }">
            <v-btn size="default" variant="outlined" color="primary" v-bind="props">Editar precios</v-btn>
          </template>
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-currency-usd</v-icon>
              Lista de precios
              <v-spacer />
              <v-btn icon="mdi-close" variant="text" @click="showPrices = false" />
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <h4 class="text-subtitle-1 mb-2 text-primary">Servicios</h4>
                  <v-list density="compact" lines="three">
                    <v-list-item v-for="(p, i) in prices.state.core" :key="'core-'+i">
                      <v-list-item-title class="d-flex align-center justify-space-between price-item-title">
                        <span class="mr-2">{{ p.label }}</span>
                        <v-text-field
                          class="ml-2"
                          type="number"
                          variant="outlined"
                          density="compact"
                          hide-details
                          style="max-width: 200px"
                          v-model.number="prices.state.core[i].price"
                        />
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col cols="12" md="4">
                  <h4 class="text-subtitle-1 mb-2 text-primary">Adicionales</h4>
                  <v-list density="compact" lines="three">
                    <v-list-item v-for="(p, i) in prices.state.addons" :key="'addons-'+i">
                      <v-list-item-title class="d-flex align-center justify-space-between price-item-title">
                        <span class="mr-2">{{ p.label }}</span>
                        <v-text-field
                          class="ml-2"
                          type="number"
                          variant="outlined"
                          density="compact"
                          hide-details
                          style="max-width: 200px"
                          v-model.number="prices.state.addons[i].price"
                        />
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col cols="12" md="4">
                  <h4 class="text-subtitle-1 mb-2 text-primary">Retirados</h4>
                  <v-list density="compact" lines="three">
                    <v-list-item v-for="(p, i) in prices.state.removal" :key="'removal-'+i">
                      <v-list-item-title class="d-flex align-start justify-space-between price-item-title">
                        <div class="mr-2">
                          <div>{{ formatRemoval(p.label).title }}</div>
                          <div class="text-caption text-medium-emphasis">{{ formatRemoval(p.label).detail }}</div>
                        </div>
                        <v-text-field
                          class="ml-2"
                          type="number"
                          variant="outlined"
                          density="compact"
                          hide-details
                          style="max-width: 200px"
                          v-model.number="prices.state.removal[i].price"
                        />
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn variant="text" @click="showPrices = false">Cerrar</v-btn>
              <v-btn color="primary" @click="savePrices">Guardar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="searchQuery"
          label="Buscar por nombre o apellido"
          variant="outlined"
          clearable
        />
      </v-col>
    </v-row>

    <!-- Skeleton Loader -->
    <v-row v-if="store.loading.initial">
      <v-col cols="12" md="6" v-for="n in 6" :key="`skeleton-${n}`">
        <v-card
          class="mb-4 client-card skeleton-card"
          rounded="lg"
          elevation="1"
          variant="outlined"
        >
          <v-card-title class="pb-2">
            <v-skeleton-loader type="text" width="70%" height="24" />
          </v-card-title>
          <v-card-subtitle class="pb-2">
            <v-skeleton-loader type="text" width="50%" height="20" />
          </v-card-subtitle>
          <v-card-text class="pt-0">
            <v-skeleton-loader type="chip" width="90px" height="28" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Clientes reales -->
    <v-row v-else>
      <v-col cols="12" md="6" v-for="c in filteredClients" :key="c.id">
        <v-card
          class="mb-4 client-card"
          rounded="lg"
          elevation="2"
          @click="$router.push(`/clientes/${c.id}`)"
          hover
        >
          <v-card-title class="text-primary font-weight-medium">
            {{ c.lastName }}, {{ c.firstName }}
          </v-card-title>
          <v-card-subtitle class="text-medium-emphasis">
            DNI: {{ c.dni }}
          </v-card-subtitle>
          <v-card-text>
            <v-chip color="primary" variant="flat" size="small">{{ c.visits.length }} turnos</v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mensaje cuando no hay clientas -->
    <v-row v-if="!store.loading && filteredClients.length === 0">
      <v-col cols="12" class="text-center">
        <v-card class="pa-8" variant="outlined">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-account-group-outline</v-icon>
          <h3 class="text-h6 text-grey-darken-1 mb-2">No se encontraron clientas</h3>
          <p class="text-body-2 text-grey-medium-emphasis">
            {{ searchQuery ? 'No hay clientas que coincidan con tu búsqueda.' : 'Aún no hay clientas registradas.' }}
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClientsStore } from '../stores/clients'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { app } from '../firebase'
import { usePricesStore } from '../stores/prices'

const store = useClientsStore()
const router = useRouter()
const prices = usePricesStore()

const showNew = ref(false)
const firstName = ref('')
const lastName = ref('')
const dni = ref('')
const error = ref('')

const searchQuery = ref('')
const filteredClients = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return store.sortedClients
  return store.sortedClients.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
    `${c.lastName} ${c.firstName}`.toLowerCase().includes(q)
  )
})

onMounted(() => {
  onAuthStateChanged(getAuth(app), (u) => {
    console.log('[ClientesView] onAuthStateChanged isAuthenticated =', !!u)
  })
  prices.loadOnce().catch(() => {})
})

async function createClient() {
  error.value = ''
  if (!firstName.value || !lastName.value || !dni.value) return
  try {
    console.log('[ClientesView] creando clienta', { firstName: firstName.value, lastName: lastName.value, dni: dni.value })
    const c = await store.upsertClient(firstName.value, lastName.value, dni.value)
    console.log('[ClientesView] creada id', c.id)
    showNew.value = false
    firstName.value = ''
    lastName.value = ''
    dni.value = ''
    router.push(`/clientes/${c.id}`)
  } catch (e) {
    console.error('[ClientesView] error al crear clienta', e)
    error.value = 'No se pudo crear la clienta. Revisá la consola para más detalles.'
  }
}

const showPrices = ref(false)
const saved = ref(false)
async function savePrices() {
  try {
    console.log('[ClientesView] Guardando precios ...')
    await prices.updatePrices({ ...prices.state })
    showPrices.value = false
    saved.value = true
    console.log('[ClientesView] Precios guardados OK')
  } catch (e) {
    console.error('[ClientesView] Error guardando precios', e)
  }
}

function formatRemoval(label: string) {
  const m = label.match(/^([^()]+)\s*\(([^)]+)\)\s*$/)
  if (!m) return { title: label, detail: '' }
  return { title: m[1].trim(), detail: `(${m[2].trim()})` }
}
</script>

<style scoped>
.client-card {
  transition: box-shadow 0.2s ease, transform 0.1s ease;
  background-color: #FFFFFF; /* surface */
}
.client-card:hover {
  transform: translateY(-1px);
}
</style>