<template>
  <div>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="12">
          <!-- Header informativo -->
          <v-card class="mb-6">
            <v-card-title class="text-center text-h4 text-primary">
              <v-icon start size="large">mdi-calendar-check</v-icon>
              Gestión de Reservas
            </v-card-title>
            <v-card-text class="text-center">
              <p class="text-body-1">
                Administra todas las reservas de turnos realizadas por las clientas.
                Puedes ver detalles, cancelar o marcar como completadas las reservas.
              </p>
            </v-card-text>
          </v-card>

          <!-- Componente de gestión de reservas -->
          <ReservasAdmin />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppointmentsStore } from '../stores/appointments'
import { useTurnosStore } from '../stores/turnos'
import ReservasAdmin from '../components/ReservasAdmin.vue'

const appointmentsStore = useAppointmentsStore()
const turnosStore = useTurnosStore()

// Inicializar stores al montar la vista
onMounted(async () => {
  console.log('[AdminReservasView] Inicializando vista de administración de reservas')
  
  try {
    // Inicializar suscripciones si no están ya activas
    if (appointmentsStore.appointments.length === 0) {
      console.log('[AdminReservasView] Inicializando suscripción de reservas')
      appointmentsStore.initSubscription()
    }
    
    if (turnosStore.turnos.length === 0) {
      console.log('[AdminReservasView] Inicializando suscripción de turnos')
      turnosStore.initSubscription()
    }
  } catch (error) {
    console.error('[AdminReservasView] Error al inicializar:', error)
  }
})
</script>

<style scoped>
/* Estilos específicos para la vista de administración de reservas */
</style>
