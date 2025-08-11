<template>
  <div>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="10">
          <v-card class="mb-6">
            <v-card-title class="text-center text-h4 text-primary">
              Administrar Turnos
            </v-card-title>
            <v-card-text class="text-center">
              <p class="text-body-1">
                Carga nuevos turnos disponibles para que las clientas puedan reservar.
              </p>
            </v-card-text>
          </v-card>

          <!-- Formulario para crear turnos -->
          <v-card class="mb-6">
            <v-card-title class="text-h6">
              Crear Nuevo Turno
            </v-card-title>
            <v-card-text>
              <v-form ref="form" v-model="formValid">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="nuevoTurno.fecha"
                      label="Fecha"
                      type="date"
                      :rules="[v => !!v || 'Fecha es requerida']"
                      variant="outlined"
                      :min="fechaMinima"
                      required
                      @update:model-value="validarFormulario"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="nuevoTurno.hora"
                      label="Hora"
                      type="time"
                      :rules="[v => !!v || 'Hora es requerida']"
                      variant="outlined"
                      required
                      @update:model-value="validarFormulario"
                    ></v-text-field>
                  </v-col>
                </v-row>
                
                <v-row>
                  <v-col cols="12" class="d-flex align-center justify-center">
                    <v-btn
                      color="primary"
                      size="large"
                      @click="crearTurno"
                      :loading="turnosStore.loading"
                      :disabled="!formValid"
                      block
                    >
                      <v-icon start v-if="!turnosStore.loading">mdi-plus</v-icon>
                      {{ turnosStore.loading ? 'Creando Turno...' : 'Crear Turno' }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>

          <!-- Lista de turnos existentes -->
          <v-card>
            <v-card-title class="text-h6 d-flex align-center justify-space-between">
              Turnos Existentes
              <div class="d-flex align-center">
                <v-btn
                  color="info"
                  variant="outlined"
                  @click="recargarTurnosManual"
                  :loading="turnosStore.loading"
                  class="mr-2"
                >
                  <v-icon start>mdi-database-refresh</v-icon>
                  Recargar Manual
                </v-btn>
                <v-btn
                  color="secondary"
                  variant="outlined"
                  @click="cargarTurnos"
                  :loading="turnosStore.loading"
                >
                  <v-icon start>mdi-refresh</v-icon>
                  Actualizar
                </v-btn>
              </div>
            </v-card-title>
            <v-card-text>
              <!-- Loading -->
              <div v-if="turnosStore.loading" class="text-center py-8">
                <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
                <p class="mt-2">Cargando turnos...</p>
              </div>

              <!-- Sin turnos -->
              <div v-else-if="turnosStore.turnos.length === 0" class="text-center py-8">
                <v-icon size="64" color="grey" class="mb-4">mdi-calendar-blank</v-icon>
                <h3 class="text-h6 mb-2">No hay turnos cargados</h3>
                <p class="text-body-2 text-medium-emphasis">
                  Crea el primer turno usando el formulario de arriba.
                </p>
              </div>

              <!-- Lista de turnos -->
              <div v-else>
                <div v-for="(turnosDelDia, fecha) in turnosAgrupados" :key="fecha" class="mb-4">
                  <h4 class="text-h6 text-primary mb-3">{{ formatDate(fecha) }}</h4>
                  <v-row>
                    <v-col 
                      v-for="turno in turnosDelDia" 
                      :key="turno.id" 
                      cols="12" 
                      sm="6" 
                      md="4"
                    >
                      <v-card variant="outlined">
                        <v-card-text class="pa-4">
                          <div class="d-flex justify-space-between align-center mb-2">
                            <span class="text-h6 font-weight-bold">{{ turno.hora }}</span>
                            <v-chip 
                              :color="turno.disponible ? 'success' : 'error'"
                              size="small"
                            >
                              {{ turno.disponible ? 'Disponible' : 'Reservado' }}
                            </v-chip>
                          </div>
                          <div class="text-body-2 text-medium-emphasis mb-2">
                            {{ turno.tipo === 'con_retirado' ? 'Con retirado' : 'Sin retirado' }}
                          </div>
                          <div class="text-caption text-medium-emphasis mb-3">
                            {{ turno.duracion }} min
                          </div>
                          <div class="d-flex gap-2">
                            <v-btn
                              size="small"
                              color="warning"
                              variant="outlined"
                              @click="editarTurno(turno)"
                              :disabled="!turno.disponible"
                            >
                              <v-icon start size="small">mdi-pencil</v-icon>
                              Editar
                            </v-btn>
                                                         <v-btn
                               size="small"
                               color="error"
                               variant="outlined"
                               @click="eliminarTurno(turno.id || '')"
                               :disabled="!turno.disponible"
                             >
                              <v-icon start size="small">mdi-delete</v-icon>
                              Eliminar
                            </v-btn>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Snackbar para mensajes -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showSnackbar = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useTurnosStore } from '../stores/turnos'
import { TurnoSlot } from '../stores/turnos'
import { formatDate } from '../utils/discount'

const turnosStore = useTurnosStore()

const form = ref()
const formValid = ref(false)
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// Formulario para nuevo turno
const nuevoTurno = ref({
  fecha: new Date().toISOString().split('T')[0],
  hora: '09:00'
})

// Fecha mínima (hoy)
const fechaMinima = computed(() => {
  const hoy = new Date()
  return hoy.toISOString().split('T')[0]
})

// Turnos agrupados por fecha
const turnosAgrupados = computed(() => {
  const grupos: Record<string, TurnoSlot[]> = {}
  
  turnosStore.turnos.forEach(turno => {
    if (!grupos[turno.fecha]) {
      grupos[turno.fecha] = []
    }
    grupos[turno.fecha].push(turno)
  })
  
  // Ordenar por fecha y hora
  Object.keys(grupos).forEach(fecha => {
    grupos[fecha].sort((a, b) => a.hora.localeCompare(b.hora))
  })
  
  return grupos
})

let unsubscribe: (() => void) | null = null

onMounted(() => {
  // Inicializar suscripción
  unsubscribe = turnosStore.initSubscription()
  
  // Establecer valores por defecto
  const ahora = new Date()
  nuevoTurno.value.fecha = ahora.toISOString().split('T')[0]
  nuevoTurno.value.hora = '09:00'
  
  // Validar formulario después de que Vue actualice el DOM
  nextTick(() => {
    console.log('Valores iniciales establecidos:', nuevoTurno.value)
    validarFormulario()
  })
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

const crearTurno = async () => {
  try {
    console.log('=== INICIANDO CREACIÓN DE TURNO ===')
    console.log('Datos del turno a crear:', {
      ...nuevoTurno.value,
      disponible: true,
      tipo: 'con_retirado',
      duracion: 90
    })
    
    await turnosStore.crearTurno({
      ...nuevoTurno.value,
      disponible: true,
      tipo: 'con_retirado',
      duracion: 90
    })
    
    console.log('Turno creado exitosamente en Firestore')
    
    // Esperar un momento para que la suscripción se actualice
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Verificar que el turno aparezca en la lista
    console.log('Turnos actuales en el store:', turnosStore.turnos.length)
    console.log('Último turno creado:', turnosStore.turnos[turnosStore.turnos.length - 1])
    
    // Resetear formulario
    nuevoTurno.value.fecha = new Date().toISOString().split('T')[0]
    nuevoTurno.value.hora = '09:00'
    
    // Validar formulario después del reset
    nextTick(() => {
      validarFormulario()
    })
    
    mostrarMensaje('Turno creado exitosamente', 'success')
    console.log('=== FIN CREACIÓN DE TURNO ===')
  } catch (err) {
    console.error('Error al crear turno:', err)
    mostrarMensaje(`Error al crear turno: ${err instanceof Error ? err.message : 'Error desconocido'}`, 'error')
  }
}

const editarTurno = (turno: TurnoSlot) => {
  // Por ahora solo permitimos editar fecha y hora
  nuevoTurno.value = {
    fecha: turno.fecha,
    hora: turno.hora
  }
  
  // Validar formulario después de editar
  nextTick(() => {
    validarFormulario()
  })
}

const eliminarTurno = async (id: string) => {
  if (confirm('¿Estás seguro de que quieres eliminar este turno?')) {
    try {
      await turnosStore.eliminarTurno(id)
      mostrarMensaje('Turno eliminado exitosamente', 'success')
    } catch (err) {
      mostrarMensaje('Error al eliminar turno', 'error')
    }
  }
}

const cargarTurnos = () => {
  // La suscripción ya está activa, pero podríamos recargar si es necesario
  mostrarMensaje('Turnos actualizados', 'info')
}

const recargarTurnosManual = async () => {
  try {
    await turnosStore.recargarTurnos()
    mostrarMensaje('Turnos cargados manualmente', 'success')
  } catch (err) {
    mostrarMensaje('Error al cargar turnos manualmente', 'error')
  }
}

const validarFormulario = () => {
  const fecha = nuevoTurno.value.fecha
  const hora = nuevoTurno.value.hora
  
  console.log('=== VALIDACIÓN DEL FORMULARIO ===')
  console.log('Fecha actual:', fecha, 'Tipo:', typeof fecha)
  console.log('Hora actual:', hora, 'Tipo:', typeof hora)
  console.log('Fecha válida:', !!fecha)
  console.log('Hora válida:', !!hora)
  
  const esValido = !!(fecha && hora)
  console.log('Formulario válido:', esValido)
  console.log('formValid antes:', formValid.value)
  
  formValid.value = esValido
  
  console.log('formValid después:', formValid.value)
  console.log('=== FIN VALIDACIÓN ===')
}

// Usar watch con deep: true para detectar cambios en propiedades del objeto
watch(nuevoTurno, (newVal, oldVal) => {
  console.log('nuevoTurno cambió:', { newVal, oldVal })
  validarFormulario()
}, { deep: true, immediate: true })

// Watchers adicionales específicos para cada propiedad
watch(() => nuevoTurno.value.fecha, (newFecha, oldFecha) => {
  console.log('Fecha cambió:', { newFecha, oldFecha })
  validarFormulario()
})

watch(() => nuevoTurno.value.hora, (newHora, oldHora) => {
  console.log('Hora cambió:', { newHora, oldHora })
  validarFormulario()
})

const mostrarMensaje = (mensaje: string, color: 'success' | 'error' | 'info') => {
  snackbarMessage.value = mensaje
  snackbarColor.value = color
  showSnackbar.value = true
}

const mostrarEstadoCompleto = () => {
  console.log('=== ESTADO COMPLETO DEL FORMULARIO ===')
  console.log('Nuevo Turno:', nuevoTurno.value)
  console.log('Fecha actual:', nuevoTurno.value.fecha, 'Tipo:', typeof nuevoTurno.value.fecha)
  console.log('Hora actual:', nuevoTurno.value.hora, 'Tipo:', typeof nuevoTurno.value.hora)
  console.log('Fecha válida:', !!nuevoTurno.value.fecha)
  console.log('Hora válida:', !!nuevoTurno.value.hora)
  console.log('Formulario válido:', formValid.value)
  console.log('=== FIN ESTADO COMPLETO ===')
}

const verificarSuscripcion = () => {
  console.log('=== VERIFICANDO ESTADO DE SUSCRIPCIÓN Y TURNOS ===')
  console.log('Turnos en el store:', turnosStore.turnos.length)
  console.log('Turnos actuales:', turnosStore.turnos)
  console.log('Loading state:', turnosStore.loading)
  console.log('Error state:', turnosStore.error)
  console.log('=== FIN VERIFICACIÓN ===')
}

const verificarColeccion = async () => {
  try {
    console.log('=== VERIFICANDO COLECCIÓN DE TURNOS ===')
    console.log('Intentando acceder a la colección: slots')
    
    // Importar las funciones de Firestore dinámicamente
    const { collection, getDocs } = await import('firebase/firestore')
    const { db } = await import('../firebase')
    
    const querySnapshot = await getDocs(collection(db, 'slots'))
    console.log('Colección accesible, documentos encontrados:', querySnapshot.size)
    
    querySnapshot.forEach((doc) => {
      console.log('Documento existente:', doc.id, doc.data())
    })
    
    console.log('=== FIN VERIFICACIÓN DE COLECCIÓN ===')
  } catch (error) {
    console.error('Error al verificar colección:', error)
  }
}
</script>
