import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

export interface TurnoSlot {
  id?: string
  fecha: string // YYYY-MM-DD
  hora: string // HH:MM
  tipo: 'con_retirado' | 'sin_retirado'
  duracion: number // minutos
  disponible: boolean
  createdAt: Date
  updatedAt: Date
}

export const useTurnosStore = defineStore('turnos', () => {
  const turnos = ref<TurnoSlot[]>([])
  const loading = ref(false)
  const initializing = ref(true) // Nuevo estado para carga inicial
  const error = ref<string | null>(null)

  // Computed: turnos disponibles ordenados por fecha y hora
  const turnosDisponibles = computed(() => {
    const disponibles = turnos.value
      .filter(t => t.disponible)
      .sort((a, b) => {
        // Ordenar por fecha y hora
        const fechaA = new Date(a.fecha + 'T' + a.hora)
        const fechaB = new Date(b.fecha + 'T' + b.hora)
        return fechaA.getTime() - fechaB.getTime()
      })
    
    return disponibles
  })

  // Computed: turnos por fecha agrupados
  const turnosPorFecha = computed(() => {
    const grupos: Record<string, TurnoSlot[]> = {}
    
    turnosDisponibles.value.forEach(turno => {
      if (!grupos[turno.fecha]) {
        grupos[turno.fecha] = []
      }
      grupos[turno.fecha].push(turno)
    })
    
    return grupos
  })

  // Inicializar suscripción a Firestore
  const initSubscription = () => {
    // Establecer estado de inicialización
    initializing.value = true
    error.value = null
    
    const q = query(
      collection(db, 'slots'),
      orderBy('fecha'),
      orderBy('hora')
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: TurnoSlot[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        docs.push({
          id: doc.id,
          fecha: data.fecha,
          hora: data.hora,
          tipo: data.tipo,
          duracion: data.duracion,
          disponible: data.disponible,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        })
      })
      
      turnos.value = docs
      initializing.value = false // Marcar como inicializado
    }, (firestoreError) => {
      console.error('[turnosStore] Error en onSnapshot:', firestoreError)
      error.value = 'Error al cargar turnos'
      initializing.value = false
    })
    
    return unsubscribe
  }

  // Crear nuevo turno
  const crearTurno = async (turno: Omit<TurnoSlot, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      loading.value = true
      error.value = null
      
      const turnoData = {
        ...turno,
        createdAt: new Date(), // Assuming Timestamp.now() is not needed for new documents
        updatedAt: new Date()
      }
      
      const docRef = await addDoc(collection(db, 'slots'), turnoData)
      
      console.log('[turnosStore] Turno creado exitosamente con ID:', docRef.id)
      
    } catch (err) {
      console.error('[turnosStore] Error al crear turno:', err)
      error.value = 'Error al crear turno'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actualizar turno en Firestore
  const actualizarTurno = async (id: string, updates: Partial<TurnoSlot>) => {
    try {
      loading.value = true
      error.value = null
      
      // Actualizar en Firestore
      const turnoRef = doc(db, 'slots', id)
      await updateDoc(turnoRef, {
        ...updates,
        updatedAt: new Date()
      })
      
      // Actualizar también el estado local inmediatamente
      const turnoIndex = turnos.value.findIndex(t => t.id === id)
      if (turnoIndex !== -1) {
        Object.assign(turnos.value[turnoIndex], updates, {
          updatedAt: new Date()
        })
      } else {
        console.warn('[turnosStore] Turno no encontrado en estado local para actualizar:', id)
      }
      
    } catch (err) {
      console.error('[turnosStore] Error al actualizar turno:', err)
      error.value = 'Error al actualizar turno'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Eliminar turno
  const eliminarTurno = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      
      await deleteDoc(doc(db, 'slots', id))
    } catch (err) {
      console.error('[turnosStore] Error al eliminar turno:', err)
      error.value = 'Error al eliminar turno'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Marcar turno como no disponible (cuando se reserva)
  const marcarNoDisponible = async (id: string) => {
    try {
      // Actualizar en Firestore
      await actualizarTurno(id, { disponible: false })
      
      // Actualizar también el estado local inmediatamente
      const turnoIndex = turnos.value.findIndex(t => t.id === id)
      if (turnoIndex !== -1) {
        turnos.value[turnoIndex].disponible = false
      } else {
        console.warn('[turnosStore] Turno no encontrado en estado local:', id)
      }
      
    } catch (error) {
      console.error('[turnosStore] Error al marcar turno como no disponible:', error)
      throw error
    }
  }

  // Forzar recarga de turnos
  const recargarTurnos = async () => {
    try {
      loading.value = true
      error.value = null
      
      const q = query(
        collection(db, 'slots'),
        orderBy('fecha'),
        orderBy('hora')
      )
      
      const snapshot = await collection(db, 'slots').get()
      
      const docs: TurnoSlot[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        docs.push({
          id: doc.id,
          fecha: data.fecha,
          hora: data.hora,
          tipo: data.tipo,
          duracion: data.duracion,
          disponible: data.disponible,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        })
      })
      
      turnos.value = docs
      
    } catch (err) {
      console.error('[turnosStore] Error en recarga manual:', err)
      error.value = 'Error al recargar turnos'
    } finally {
      loading.value = false
    }
  }

  return {
    // Estado
    turnos,
    loading,
    error,
    initializing,
    
    // Computed
    turnosDisponibles,
    turnosPorFecha,
    
    // Acciones
    initSubscription,
    crearTurno,
    actualizarTurno,
    eliminarTurno,
    marcarNoDisponible,
    recargarTurnos
  }
})
