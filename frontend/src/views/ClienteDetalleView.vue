<template>
  <v-container v-if="client">
    <v-row>
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbs" class="px-0" />
        <h2 class="text-h4 mb-2">{{ client.lastName }}, {{ client.firstName }}</h2>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="5">
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center">
            <span>Datos de la clienta</span>
            <v-spacer />
            <template v-if="isAuthenticated">
              <v-btn icon="mdi-pencil" variant="text" @click="toggleEdit" v-if="!isEditing" />
              <v-btn icon="mdi-content-save" variant="text" color="primary" @click="saveClient" :disabled="!firstName || !lastName || !dni" v-else />
              <v-btn icon="mdi-close" variant="text" v-if="isEditing" @click="cancelEdit" />
              <v-btn icon="mdi-delete" variant="text" color="error" @click="confirmDelete = true" />
            </template>
            <v-btn icon="mdi-currency-usd" variant="text" @click="showPrices = true" />
          </v-card-title>
          <v-card-text>
            <template v-if="!isEditing">
              <div><strong>Nombre:</strong> {{ client.firstName }} {{ client.lastName }}</div>
              <div><strong>DNI:</strong> {{ client.dni }}</div>
            </template>
            <template v-else>
              <v-form @submit.prevent="saveClient">
                <v-text-field v-model="firstName" label="Nombre" variant="outlined" />
                <v-text-field v-model="lastName" label="Apellido" variant="outlined" />
                <v-text-field v-model="dni" label="DNI" variant="outlined" />
              </v-form>
              <v-alert v-if="error" type="error" variant="tonal" class="mt-2">{{ error }}</v-alert>
            </template>
          </v-card-text>
        </v-card>
        <!-- Dialogo de precios -->
        <v-dialog v-model="showPrices" max-width="800">
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
                  <v-list density="compact" lines="two" class="elev-0">
                    <v-list-item v-for="p in prices.core" :key="p.label">
                      <v-list-item-title>{{ p.label }}</v-list-item-title>
                      <v-list-item-subtitle>{{ currency(p.price) }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col cols="12" md="4">
                  <h4 class="text-subtitle-1 mb-2 text-primary">Adicionales</h4>
                  <v-list density="compact" lines="two" class="elev-0">
                    <v-list-item v-for="p in prices.addons" :key="p.label">
                      <v-list-item-title>{{ p.label }}</v-list-item-title>
                      <v-list-item-subtitle>{{ currency(p.price) }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col cols="12" md="4">
                  <h4 class="text-subtitle-1 mb-2 text-primary">Retirados</h4>
                  <v-list density="compact" lines="two" class="elev-0">
                    <v-list-item v-for="p in prices.removal" :key="p.label">
                      <v-list-item-title>{{ formatRemoval(p.label).title }}</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ formatRemoval(p.label).detail }} · {{ currency(p.price) }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-dialog>

        <v-dialog v-model="confirmDelete" max-width="400">
          <v-card>
            <v-card-title>Eliminar clienta</v-card-title>
            <v-card-text>Esta acción eliminará a la clienta y su historial de turnos. ¿Confirmás?</v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn variant="text" @click="confirmDelete = false">Cancelar</v-btn>
              <v-btn color="error" @click="doDelete">Eliminar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-card v-if="isAuthenticated" class="mb-4">
          <v-card-title>Nuevo turno</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="saveVisit">
              <v-text-field
                v-model="visitDate"
                label="Fecha"
                type="date"
                required
                variant="outlined"
              />
              <v-select
                v-model="serviceKey"
                :items="serviceItems"
                item-title="name"
                item-value="key"
                label="Servicio"
                required
                variant="outlined"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" @click="saveVisit" :disabled="!visitDate || !serviceKey">Guardar turno</v-btn>
          </v-card-actions>
        </v-card>

        <v-card>
          <v-card-title>Estado del descuento</v-card-title>
          <v-card-text>
            <div class="mb-2">
              <strong>Visitas totales:</strong> {{ status.totalVisits }}
            </div>
            <div class="mb-2">
              <strong>Progreso al descuento (cada 3 turnos):</strong>
              <v-chip color="primary" variant="flat">{{ status.visitsSinceLastDiscount }}/3</v-chip>
            </div>
            <div class="mb-2">
              <strong>Debe volver antes de:</strong>
              {{ nextDeadlineFormatted }}
              <span v-if="status.requiredMaxDays && status.lastServiceKey">
                ({{ status.requiredMaxDays }} días máx. para {{ serviceName(status.lastServiceKey) }})
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="7">
        <v-card>
          <v-card-title>Historial de turnos</v-card-title>
          <v-data-table
            :headers="headers"
            :items="tableItems"
            :items-per-page="5"
          >
            <template v-if="isAuthenticated" v-slot:[`item.actions`]="{ item }">
              <v-btn icon="mdi-delete" color="error" variant="text" @click="remove(item.id)" />
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <v-container v-else>
    <v-alert type="error" variant="tonal">Clienta no encontrada</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClientsStore } from '../stores/clients'
import { SERVICES } from '../data/services'
import { formatDate, computeVisitDiscounts } from '../utils/discount'
import type { ServiceKey } from '../types'
import { useAuthStore } from '../stores/auth'
import { usePricesStore } from '../stores/prices'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { app } from '../firebase'

const route = useRoute()
const router = useRouter()
const store = useClientsStore()
const auth = useAuthStore()
const isAuthenticated = ref(false)
onAuthStateChanged(getAuth(app), (u) => {
  isAuthenticated.value = !!u
  console.log('[ClienteDetalle] onAuthStateChanged isAuthenticated =', isAuthenticated.value)
})
console.log('[ClienteDetalle] isAuthenticated (init) =', isAuthenticated.value)
const clientId = String(route.params.id)
const client = ref(store.getClientById(clientId))
watchEffect(async () => {
  if (!client.value) {
    const fetched = await store.fetchById(clientId)
    client.value = fetched
  }
})

const status = computed(() => store.getDiscountStatus(clientId) || {
  totalVisits: 0,
  visitsSinceLastDiscount: 0,
  nextVisitInCycle: 3,
  lastServiceKey: null,
  requiredMaxDays: null,
  nextDeadlineDateISO: null,
})

const nextDeadlineFormatted = computed(() => formatDate(status.value.nextDeadlineDateISO))

const visitDate = ref<string>('')
const serviceKey = ref<ServiceKey | null>(null)

const serviceItems = SERVICES

function serviceName(key: ServiceKey) {
  return SERVICES.find(s => s.key === key)?.name || key
}

function saveVisit() {
  if (!client.value || !visitDate.value || !serviceKey.value) return
  if (!isAuthenticated.value) {
    console.warn('[ClienteDetalle] Intento de agregar turno sin autenticación')
    return
  }
  // Guardar la fecha exactamente como fue ingresada (YYYY-MM-DD) para evitar desfase de zona horaria
  store.addVisit(client.value.id, visitDate.value, serviceKey.value)
  visitDate.value = ''
  serviceKey.value = null
}

function remove(visitId: string) {
  if (!client.value) return
  if (!isAuthenticated.value) {
    console.warn('[ClienteDetalle] Intento de eliminar turno sin autenticación')
    return
  }
  store.removeVisit(client.value.id, visitId)
}

// Admin: editar / eliminar clienta
const firstName = computed({
  get: () => client.value?.firstName || '',
  set: (v: string) => { if (client.value) client.value.firstName = v }
})
const lastName = computed({
  get: () => client.value?.lastName || '',
  set: (v: string) => { if (client.value) client.value.lastName = v }
})
const dni = computed({
  get: () => client.value?.dni || '',
  set: (v: string) => { if (client.value) client.value.dni = v }
})
const error = ref('')
const confirmDelete = ref(false)
const isEditing = ref(false)
const showPrices = ref(false)
const pricesStore = usePricesStore()
const prices = pricesStore.state

function currency(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

function formatRemoval(label: string) {
  // Ej: "Retirado otra colega (Semipermanente/Kapping)"
  const m = label.match(/^([^()]+)\s*\(([^)]+)\)\s*$/)
  if (!m) return { title: label, detail: '' }
  return { title: m[1].trim(), detail: `(${m[2].trim()})` }
}

async function saveClient() {
  error.value = ''
  if (!client.value) return
  try {
    await store.updateClient(client.value.id, {
      firstName: firstName.value,
      lastName: lastName.value,
      dni: dni.value,
    })
    isEditing.value = false
  } catch (e: any) {
    error.value = e?.message || 'No se pudo guardar'
  }
}

async function doDelete() {
  if (!client.value) return
  await store.deleteClient(client.value.id)
  confirmDelete.value = false
  router.push({ name: 'clientes', query: { msg: 'client_deleted' } })
}

function toggleEdit() {
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
}

const headers = computed(() => [
  { title: 'Fecha', key: 'date' },
  { title: 'Servicio', key: 'service' },
  { title: 'Descuento', key: 'discount' },
  { title: 'Motivo', key: 'reason' },
  ...(isAuthenticated.value ? [{ title: 'Acciones', key: 'actions', sortable: false }] : []),
])

const breadcrumbs = computed(() => ([
  { title: 'Clientas', to: '/clientes' },
  { title: `${client.value?.lastName || ''}, ${client.value?.firstName || ''}` }
]))

const tableItems = computed(() => {
  const visits = (client.value?.visits || []).slice().sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())
  const discounts = computeVisitDiscounts(visits)
  const items = visits.map(v => {
    const disc = discounts[v.id]
    return {
      id: v.id,
      date: formatDate(v.dateISO),
      service: serviceName(v.serviceKey),
      discount: disc ? (disc.eligible ? `${disc.percent}%` : '-') : '-',
      reason: disc ? (disc.counted ? 'OK' : disc.reason) : '-',
    }
  })
  return items.reverse()
})
</script>