import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useClientsStore } from './clients'
import { useTurnosStore } from './turnos'

export interface Appointment {
  id?: string
  dni: string
  turnoId: string
  fecha: string // YYYY-MM-DD
  hora: string // HH:MM
  tipo: 'con_retirado' | 'sin_retirado'
  duracion: number // minutos
  estado: 'confirmado' | 'cancelado' | 'completado'
  nombreCliente: string
  apellidoCliente: string
  servicio: string
  tieneRetirado: boolean
  tipoRetirado?: string
  createdAt: Date
  updatedAt: Date
}

export const useAppointmentsStore = defineStore('appointments', () => {
  const appointments = ref<Appointment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const clientsStore = useClientsStore()
  const turnosStore = useTurnosStore()

  // Computed: reservas por cliente
  const reservasPorCliente = computed(() => {
    const grupos: Record<string, Appointment[]> = {}
    
    appointments.value.forEach(appointment => {
      if (!grupos[appointment.dni]) {
        grupos[appointment.dni] = []
      }
      grupos[appointment.dni].push(appointment)
    })
    
    return grupos
  })

  // Computed: reservas futuras
  const reservasFuturas = computed(() => {
    const ahora = new Date()
    return appointments.value
      .filter(appointment => appointment.estado === 'confirmado')
      .filter(appointment => {
        const appointmentDate = new Date(appointment.fecha + 'T' + appointment.hora)
        return appointmentDate > ahora
      })
      .sort((a, b) => {
        if (a.fecha !== b.fecha) {
          return a.fecha.localeCompare(b.fecha)
        }
        return a.hora.localeCompare(b.hora)
      })
  })

  // Inicializar suscripción a Firestore
  const initSubscription = () => {
    console.log('[appointmentsStore] Inicializando suscripción...')
    
    const q = query(
      collection(db, 'bookings'),
      orderBy('fecha'),
      orderBy('hora')
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: Appointment[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        docs.push({
          id: doc.id,
          dni: data.dni,
          turnoId: data.turnoId,
          fecha: data.fecha,
          hora: data.hora,
          tipo: data.tipo,
          duracion: data.duracion,
          estado: data.estado,
          nombreCliente: data.nombreCliente,
          apellidoCliente: data.apellidoCliente,
          servicio: data.servicio || '',
          tieneRetirado: data.tieneRetirado || false,
          tipoRetirado: data.tipoRetirado || undefined,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        })
      })
      
      appointments.value = docs
      console.log('[appointmentsStore] Reservas cargadas:', docs.length)
    }, (error) => {
      console.error('[appointmentsStore] Error en onSnapshot:', error)
      error.value = 'Error al cargar reservas'
    })
    
    return unsubscribe
  }

  // Validar si un DNI puede reservar (debe ser cliente registrado)
  const validarDNI = async (dni: string): Promise<{ valido: boolean; mensaje: string }> => {
    try {
      // Verificar que el DNI tenga formato válido
      if (!dni || dni.length < 7 || dni.length > 8) {
        return {
          valido: false,
          mensaje: 'DNI debe tener entre 7 y 8 dígitos'
        }
      }

      // Verificar que el cliente exista en la base de datos
      const cliente = await clientsStore.findOrFetchByDni(dni)
      if (!cliente) {
        return {
          valido: false,
          mensaje: 'La clienta no existe en la base de datos. Contactarse por Instagram para ser registrada y poder reservar turnos.'
        }
      }

      // Verificar que no haya reservas activas para este DNI
      const reservasActivas = appointments.value.filter(
        appointment => appointment.dni === dni && appointment.estado === 'confirmado'
      )

      if (reservasActivas.length > 0) {
        return {
          valido: false,
          mensaje: 'Ya tienes una reserva activa. Cancela la anterior antes de hacer una nueva.'
        }
      }
      
      return {
        valido: true,
        mensaje: 'DNI válido'
      }
    } catch (err) {
      console.error('[appointmentsStore] Error al validar DNI:', err)
      return {
        valido: false,
        mensaje: 'Error al validar DNI. Intenta nuevamente.'
      }
    }
  }

  // Crear nueva reserva
  const crearReserva = async (dni: string, turnoId: string, datosCliente: DatosClienteReserva) => {
    try {
      // Validar DNI
      const validacion = await validarDNI(dni)
      if (!validacion.valido) {
        return {
          success: false,
          mensaje: validacion.mensaje
        }
      }

      // Buscar turno en el store
      const turno = turnosStore.turnos.find(t => t.id === turnoId)
      if (!turno) {
        return {
          success: false,
          mensaje: 'Turno no encontrado'
        }
      }

      // Verificar que el turno esté disponible
      if (!turno.disponible) {
        return {
          success: false,
          mensaje: 'Este turno ya no está disponible'
        }
      }

      // Verificar anticipación (mínimo 8 horas antes)
      const ahora = new Date()
      // Combinar fecha y hora del turno para el cálculo correcto
      const turnoDateTime = new Date(turno.fecha + 'T' + turno.hora)
      const horasAnticipacion = (turnoDateTime.getTime() - ahora.getTime()) / (1000 * 60 * 60)
      
      console.log('[appointmentsStore] Cálculo de anticipación:', {
        ahora: ahora.toISOString(),
        turnoFecha: turno.fecha,
        turnoHora: turno.hora,
        turnoDateTime: turnoDateTime.toISOString(),
        horasAnticipacion: horasAnticipacion
      })
      
      if (horasAnticipacion < 8) {
        return {
          success: false,
          mensaje: `Debes reservar al menos 8 horas antes del turno. Faltan ${Math.ceil(horasAnticipacion)} horas.`
        }
      }

      // Crear documento de reserva en Firestore
      const appointmentData = {
        dni,
        turnoId,
        fecha: turno.fecha,
        hora: turno.hora,
        servicio: datosCliente.servicio,
        nombreCliente: datosCliente.nombre,
        apellidoCliente: datosCliente.apellido,
        tieneRetirado: datosCliente.tieneRetirado,
        tipoRetirado: datosCliente.tipoRetirado,
        estado: 'confirmado',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      console.log('[appointmentsStore] Guardando reserva:', appointmentData)

      const docRef = await addDoc(collection(db, 'bookings'), appointmentData)

      // Marcar turno como no disponible
      await turnosStore.marcarNoDisponible(turnoId)

      return {
        success: true,
        mensaje: `Turno reservado exitosamente para ${datosCliente.nombre} ${datosCliente.apellido} el ${new Date(turno.fecha).toLocaleDateString('es-ES')} a las ${turno.hora}`
      }
    } catch (err) {
      console.error('Error al crear reserva:', err)
      error.value = 'Error al crear reserva'
      return {
        success: false,
        mensaje: 'Error al crear la reserva. Intenta nuevamente.'
      }
    }
  }

  // Cancelar reserva
  const cancelarReserva = async (id: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      
      const appointment = appointments.value.find(a => a.id === id)
      if (!appointment) {
        throw new Error('Reserva no encontrada')
      }

      // Actualizar estado de la reserva
      await updateDoc(doc(db, 'bookings', id), {
        estado: 'cancelado',
        updatedAt: Timestamp.now()
      })

      // Marcar turno como disponible nuevamente
      await turnosStore.actualizarTurno(appointment.turnoId, { disponible: true })
      
      console.log('[appointmentsStore] Reserva cancelada exitosamente')
    } catch (err) {
      console.error('[appointmentsStore] Error al cancelar reserva:', err)
      error.value = 'Error al cancelar reserva'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Completar reserva
  const completarReserva = async (id: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      
      await updateDoc(doc(db, 'bookings', id), {
        estado: 'completado',
        updatedAt: Timestamp.now()
      })
      
      console.log('[appointmentsStore] Reserva marcada como completada')
    } catch (err) {
      console.error('[appointmentsStore] Error al completar reserva:', err)
      error.value = 'Error al completar reserva'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Eliminar reserva
  const eliminarReserva = async (reservaId: string) => {
    try {
      loading.value = true
      error.value = null
      
      // Eliminar documento de reserva en Firestore
      await deleteDoc(doc(db, 'bookings', reservaId))
      
      // Recargar las reservas
      await initSubscription()
      
      return {
        success: true,
        mensaje: 'Reserva eliminada exitosamente'
      }
    } catch (err) {
      console.error('Error al eliminar reserva:', err)
      error.value = 'Error al eliminar reserva'
      return {
        success: false,
        mensaje: 'Error al eliminar la reserva. Intenta nuevamente.'
      }
    } finally {
      loading.value = false
    }
  }

  return {
    appointments,
    reservas: appointments, // Alias para compatibilidad con ReservasAdmin
    reservasPorCliente,
    reservasFuturas,
    loading,
    error,
    initSubscription,
    validarDNI,
    crearReserva,
    cancelarReserva,
    completarReserva,
    eliminarReserva
  }
})
