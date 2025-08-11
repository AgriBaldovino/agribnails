<template>
  <div>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="10">
          <v-card class="mb-6">
            <v-card-title class="text-center text-h4 text-primary">
              Turnos Disponibles
              <v-chip 
                v-if="!turnosStore.initializing && turnosStore.turnos.length > 0"
                color="success" 
                size="small" 
                class="ml-3"
                variant="tonal"
              >
                <v-icon start size="small">mdi-sync</v-icon>
                En tiempo real
              </v-chip>
            </v-card-title>
            
            <v-card-text class="text-center">
              <p class="text-body-1">
                Selecciona el día y horario que prefieras para tu turno.
              </p>
              <p class="text-caption text-medium-emphasis">
                Los turnos se pueden reservar con un mínimo de 8 horas de anticipación.
              </p>
            </v-card-text>
          </v-card>

          <!-- Loading -->
          <v-row v-if="turnosStore.initializing">
            <v-col cols="12" class="text-center">
              <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
              <p class="mt-4">Cargando turnos disponibles...</p>
              <p class="text-caption text-medium-emphasis mt-2">
                Esto puede tomar unos segundos la primera vez
              </p>
            </v-col>
          </v-row>

          <!-- Sin turnos disponibles -->
          <v-row v-else-if="!turnosStore.initializing && turnosStore.turnosDisponibles.length === 0">
            <v-col cols="12" class="text-center">
              <v-card>
                <v-card-text>
                  <v-icon size="64" color="grey" class="mb-4">mdi-calendar-remove</v-icon>
                  <h3 class="text-h6 mb-2">No hay turnos disponibles</h3>
                  <p class="text-body-2 text-medium-emphasis">
                    En este momento no hay turnos disponibles. 
                    Vuelve a revisar más tarde o contáctame por Instagram.
                  </p>
                  <v-btn
                    href="https://www.instagram.com/agribnails/"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="secondary"
                    prepend-icon="mdi-instagram"
                    class="mt-4"
                  >
                    Contactar por Instagram
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Turnos disponibles -->
          <div v-else>
            <div v-for="(turnosDelDia, fecha) in turnosStore.turnosPorFecha" :key="fecha" class="mb-6">
              <v-card>
                <v-card-title class="text-h6 text-primary">
                  {{ formatDate(fecha) }}
                </v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col 
                      v-for="turno in turnosDelDia" 
                      :key="turno.id" 
                      cols="12" 
                      sm="6" 
                      md="4"
                    >
                      <v-card 
                        variant="outlined" 
                        class="turno-card"
                        :class="{ 'turno-seleccionado': turnoSeleccionado?.id === turno.id }"
                        @click="seleccionarTurno(turno)"
                      >
                        <v-card-text class="text-center pa-4">
                          <div class="text-h6 font-weight-bold text-primary">
                            {{ turno.hora }}
                          </div>
                          <div class="text-body-2 text-medium-emphasis mt-2">
                            {{ turno.tipo === 'con_retirado' ? 'Incluye retirado' : 'Sin retirado' }}
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            {{ turno.duracion }} min
                          </div>
                          <v-chip 
                            v-if="turnoSeleccionado?.id === turno.id"
                            color="success" 
                            size="small" 
                            class="mt-2"
                          >
                            Seleccionado
                          </v-chip>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </div>

            <!-- El modal de reserva se abre automáticamente al seleccionar un turno -->
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Modal de reserva -->
    <ReservaModal
      v-model="showModalReserva"
      :turno="turnoSeleccionado"
      @reserva-exitosa="onReservaExitosa"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTurnosStore } from '../stores/turnos'
import { useAppointmentsStore } from '../stores/appointments'
import { TurnoSlot } from '../stores/turnos'
import ReservaModal from '../components/ReservaModal.vue'
import { formatDate } from '../utils/discount'

const turnosStore = useTurnosStore()
const appointmentsStore = useAppointmentsStore()

const turnoSeleccionado = ref<TurnoSlot | null>(null)
const showModalReserva = ref(false)

let unsubscribe: (() => void) | null = null

onMounted(() => {
  // Inicializar suscripciones
  unsubscribe = turnosStore.initSubscription()
  appointmentsStore.initSubscription()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

const seleccionarTurno = (turno: TurnoSlot) => {
  turnoSeleccionado.value = turno
  // Abrir automáticamente el modal de reserva
  showModalReserva.value = true
}

const onReservaExitosa = () => {
  showModalReserva.value = false
  turnoSeleccionado.value = null
  // Mostrar mensaje de éxito
  // (el modal ya maneja esto)
}
</script>

<style scoped>
.turno-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.turno-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.turno-seleccionado {
  border-color: var(--v-primary-base);
  background-color: var(--v-primary-lighten5);
}

.turno-card:hover {
  border-color: var(--v-primary-base);
}
</style>
