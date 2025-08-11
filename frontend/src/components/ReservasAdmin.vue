<template>
  <div>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span>Gestión de Reservas</span>
        <v-chip color="primary" variant="tonal">
          {{ reservas.length }} reservas total
        </v-chip>
      </v-card-title>

      <v-card-text>
        <!-- Filtros -->
        <v-row class="mb-4">
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filtros.dni"
              label="Filtrar por DNI"
              variant="outlined"
              density="compact"
              clearable
              prepend-inner-icon="mdi-account-search"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filtros.estado"
              label="Filtrar por estado"
              :items="estadosDisponibles"
              variant="outlined"
              density="compact"
              clearable
              prepend-inner-icon="mdi-filter"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filtros.fecha"
              label="Filtrar por fecha"
              type="date"
              variant="outlined"
              density="compact"
              clearable
              prepend-inner-icon="mdi-calendar"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-btn
              color="secondary"
              variant="outlined"
              @click="limpiarFiltros"
              prepend-icon="mdi-refresh"
            >
              Limpiar filtros
            </v-btn>
          </v-col>
        </v-row>

        <!-- Tabla de reservas -->
        <v-data-table
          :headers="headers"
          :items="reservasFiltradas"
          :loading="appointmentsStore.loading"
          :sort-by="[{ key: 'fecha', order: 'asc' }]"
          class="elevation-1"
        >
          <!-- Columna de fecha -->
          <template #[`item.fecha`]="{ item }">
            {{ formatDate(item.fecha) }}
          </template>

          <!-- Columna de hora -->
          <template #[`item.hora`]="{ item }">
            {{ item.hora }}
          </template>

          <!-- Columna de estado -->
          <template #[`item.estado`]="{ item }">
            <v-chip
              :color="getEstadoColor(item.estado)"
              size="small"
              variant="tonal"
            >
              {{ getEstadoText(item.estado) }}
            </v-chip>
          </template>

          <!-- Columna de retirado -->
          <template #[`item.tieneRetirado`]="{ item }">
            <v-chip
              :color="item.tieneRetirado ? 'warning' : 'success'"
              size="small"
              variant="tonal"
            >
              {{ item.tieneRetirado ? 'Sí' : 'No' }}
            </v-chip>
          </template>

          <!-- Columna de acciones -->
          <template #[`item.actions`]="{ item }">
            <v-btn
              size="small"
              color="error"
              variant="outlined"
              @click="confirmarEliminar(item)"
              prepend-icon="mdi-delete"
            >
              Eliminar
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Modal de confirmación para eliminar -->
    <v-dialog v-model="dialogEliminar" max-width="400px">
      <v-card>
        <v-card-title class="text-h6 text-error">
          Confirmar eliminación
        </v-card-title>
        <v-card-text>
          ¿Estás seguro de que quieres eliminar la reserva de 
          <strong>{{ reservaAEliminar?.nombreCliente }} {{ reservaAEliminar?.apellidoCliente }}</strong>
          para el {{ formatDate(reservaAEliminar?.fecha) }} a las {{ reservaAEliminar?.hora }}?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            variant="text"
            @click="dialogEliminar = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="eliminarReserva"
            :loading="eliminando"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para mensajes -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.show = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppointmentsStore } from '../stores/appointments'

defineOptions({
  name: 'ReservasAdmin'
})

const appointmentsStore = useAppointmentsStore()

// Estado local
const filtros = ref({
  dni: '',
  estado: '',
  fecha: ''
})

const dialogEliminar = ref(false)
const reservaAEliminar = ref<any>(null)
const eliminando = ref(false)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Headers de la tabla
const headers = [
  { title: 'DNI', key: 'dni', sortable: true },
  { title: 'Nombre', key: 'nombreCliente', sortable: true },
  { title: 'Apellido', key: 'apellidoCliente', sortable: true },
  { title: 'Fecha', key: 'fecha', sortable: true },
  { title: 'Hora', key: 'hora', sortable: true },
  { title: 'Servicio', key: 'servicio', sortable: true },
  { title: 'Estado', key: 'estado', sortable: true },
  { title: 'Retirado', key: 'tieneRetirado', sortable: true },
  { title: 'Tipo Retirado', key: 'tipoRetirado', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false }
]

// Estados disponibles para filtro
const estadosDisponibles = [
  { title: 'Confirmado', value: 'confirmado' },
  { title: 'Cancelado', value: 'cancelado' },
  { title: 'Completado', value: 'completado' }
]

// Computed properties
const reservas = computed(() => appointmentsStore.reservas)
const reservasFiltradas = computed(() => {
  let filtradas = reservas.value

  if (filtros.value.dni) {
    filtradas = filtradas.filter(r => 
      r.dni.toLowerCase().includes(filtros.value.dni.toLowerCase())
    )
  }

  if (filtros.value.estado) {
    filtradas = filtradas.filter(r => r.estado === filtros.value.estado)
  }

  if (filtros.value.fecha) {
    filtradas = filtradas.filter(r => r.fecha === filtros.value.fecha)
  }

  return filtradas
})

// Métodos
const formatDate = (date: string) => {
  if (!date) return ''
  try {
    const [year, month, day] = date.split('-')
    return `${day}/${month}/${year}`
  } catch {
    return date
  }
}

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'confirmado': return 'success'
    case 'cancelado': return 'error'
    case 'completado': return 'info'
    default: return 'default'
  }
}

const getEstadoText = (estado: string) => {
  switch (estado) {
    case 'confirmado': return 'Confirmado'
    case 'cancelado': return 'Cancelado'
    case 'completado': return 'Completado'
    default: return estado
  }
}

const limpiarFiltros = () => {
  filtros.value = {
    dni: '',
    estado: '',
    fecha: ''
  }
}

const confirmarEliminar = (reserva: any) => {
  reservaAEliminar.value = reserva
  dialogEliminar.value = true
}

const eliminarReserva = async () => {
  if (!reservaAEliminar.value) return

  eliminando.value = true
  try {
    const resultado = await appointmentsStore.eliminarReserva(reservaAEliminar.value.id)
    
    if (resultado.success) {
      snackbar.value = {
        show: true,
        message: resultado.mensaje,
        color: 'success'
      }
      dialogEliminar.value = false
      reservaAEliminar.value = null
    } else {
      snackbar.value = {
        show: true,
        message: resultado.mensaje,
        color: 'error'
      }
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      message: 'Error inesperado al eliminar la reserva',
      color: 'error'
    }
  } finally {
    eliminando.value = false
  }
}

// Inicialización
onMounted(() => {
  appointmentsStore.initSubscription()
})
</script>

<style scoped>
.reservas-admin {
  padding: 16px;
}

.v-data-table {
  border-radius: 8px;
}

.v-chip {
  font-weight: 500;
}
</style>
