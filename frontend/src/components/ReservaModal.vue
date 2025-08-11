<template>
  <v-dialog v-model="dialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="text-h5 text-primary">
        Reservar Turno
      </v-card-title>
      
      <v-card-text>
        <div v-if="turno" class="mb-4">
          <v-alert type="info" variant="tonal">
            <strong>Turno seleccionado:</strong><br>
            {{ formatDate(turno.fecha) }} a las {{ turno.hora }}<br>
            {{ turno.tipo === 'con_retirado' ? 'Incluye retirado' : 'Sin retirado' }} ({{ turno.duracion }} min)
          </v-alert>
        </div>

        <v-form ref="form" v-model="formValid">
          <v-text-field
            v-model="dni"
            label="DNI"
            :rules="[v => !!v || 'DNI es requerido']"
            variant="outlined"
            placeholder="Ingresa tu DNI"
            :disabled="loading"
            @keyup.enter="reservarTurno"
          ></v-text-field>
          
          <v-text-field
            v-model="nombre"
            label="Nombre"
            :rules="[v => !!v || 'Nombre es requerido']"
            variant="outlined"
            placeholder="Ingresa tu nombre"
            :disabled="loading"
            class="mt-3"
          ></v-text-field>
          
          <v-text-field
            v-model="apellido"
            label="Apellido"
            :rules="[v => !!v || 'Apellido es requerido']"
            variant="outlined"
            placeholder="Ingresa tu apellido"
            :disabled="loading"
            class="mt-3"
          ></v-text-field>
          
          <v-select
            v-model="servicio"
            label="Servicio a realizar"
            :items="serviciosDisponibles"
            :rules="[v => !!v || 'Servicio es requerido']"
            variant="outlined"
            :disabled="loading"
            class="mt-3"
          ></v-select>
          
          <v-select
            v-model="tieneRetirado"
            label="¿Tienes algo para retirar?"
            :items="[
              { title: 'Sí', value: true },
              { title: 'No', value: false }
            ]"
            :rules="[v => v !== null || 'Selecciona una opción']"
            variant="outlined"
            :disabled="loading"
            class="mt-3"
          ></v-select>
          
          <v-select
            v-if="tieneRetirado"
            v-model="tipoRetirado"
            label="Tipo de retirado"
            :items="tiposRetirado"
            :rules="[v => !!v || 'Tipo de retirado es requerido']"
            variant="outlined"
            :disabled="loading"
            class="mt-3"
          ></v-select>
        </v-form>

        <div v-if="error" class="mt-4">
          <v-alert type="error" variant="tonal">
            {{ error }}
          </v-alert>
        </div>

        <div v-if="success" class="mt-4">
          <v-alert type="success" variant="tonal">
            {{ success }}
          </v-alert>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="cerrarModal"
          :disabled="loading"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          @click="reservarTurno"
          :loading="loading"
          :disabled="!formValid || !dni || !nombre || !apellido || !servicio || tieneRetirado === null || (tieneRetirado && !tipoRetirado)"
        >
          Confirmar Reserva
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAppointmentsStore } from '../stores/appointments'
import { TurnoSlot } from '../stores/turnos'
import { formatDate } from '../utils/discount'

interface Props {
  modelValue: boolean
  turno: TurnoSlot | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'reserva-exitosa'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const appointmentsStore = useAppointmentsStore()
const form = ref()
const formValid = ref(false)
const dni = ref('')
const nombre = ref('')
const apellido = ref('')
const servicio = ref('')
const tieneRetirado = ref<boolean | null>(null)
const tipoRetirado = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

// Servicios disponibles
const serviciosDisponibles = [
  'Esmaltado semipermanente',
  'Kapping',
  'Softgel'
]

// Tipos de retirado
const tiposRetirado = [
  'Esmaltado semipermanente',
  'Kapping',
  'Soft gel',
  'Esmaltado semipermanente de otra colega',
  'Kapping de otra colega',
  'Soft gel de otra colega'
]

// Computed para el v-model del dialog
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Limpiar formulario cuando se abre el modal
watch(dialog, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

const resetForm = () => {
  dni.value = ''
  nombre.value = ''
  apellido.value = ''
  servicio.value = ''
  tieneRetirado.value = null
  tipoRetirado.value = ''
  error.value = ''
  success.value = ''
  formValid.value = false
  if (form.value) {
    form.value.resetValidation()
  }
}

const cerrarModal = () => {
  emit('update:modelValue', false)
  resetForm()
}

const reservarTurno = async () => {
  if (!props.turno || !dni.value || !nombre.value || !apellido.value || !servicio.value || tieneRetirado.value === null || (tieneRetirado.value && !tipoRetirado.value)) {
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const resultado = await appointmentsStore.crearReserva(
      dni.value,
      props.turno.id,
      {
        nombre: nombre.value,
        apellido: apellido.value,
        servicio: servicio.value,
        tieneRetirado: tieneRetirado.value,
        tipoRetirado: tipoRetirado.value
      }
    )

    if (resultado.success) {
      success.value = resultado.mensaje
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        emit('reserva-exitosa')
        emit('update:modelValue', false)
      }, 2000)
    } else {
      error.value = resultado.mensaje
    }
  } catch (err) {
    console.error('Error al reservar turno:', err)
    error.value = 'Error inesperado al reservar el turno. Intenta nuevamente.'
  } finally {
    loading.value = false
  }
}

defineOptions({
  name: 'ReservaModal'
})
</script>
