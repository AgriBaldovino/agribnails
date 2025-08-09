import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import type { ClientRecord, VisitRecord, ServiceKey } from '../types'
import { computeDiscountStatus, uid } from '../utils/discount'
import { db } from '../firebase'
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where, getDocs, deleteDoc, getDoc } from 'firebase/firestore'

const CLIENTS_COLLECTION = 'clients'

export const useClientsStore = defineStore('clients', () => {
  const clients = reactive<ClientRecord[]>([])

  // Suscripción en tiempo real a Firestore (no necesitamos guardar el unsub aquí)
  console.log('[clientsStore] onSnapshot: inicializando suscripción...')
  onSnapshot(
    collection(db, CLIENTS_COLLECTION),
    (snap) => {
      console.log('[clientsStore] onSnapshot: docs =', snap.size)
      const loaded: ClientRecord[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<ClientRecord, 'id'>) }))
      clients.splice(0, clients.length, ...loaded.sort((a, b) => a.lastName.localeCompare(b.lastName)))
      console.log('[clientsStore] onSnapshot: clients en memoria =', clients.length)
    },
    (err) => {
      console.error('[clientsStore] onSnapshot: error', err)
    }
  )

  const sortedClients = computed(() => clients)

  async function upsertClient(firstName: string, lastName: string, dni: string): Promise<ClientRecord> {
    const existing = clients.find(
      c => c.dni === dni.trim()
    )
    if (existing) return existing

    const now = new Date().toISOString()
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dni: dni.trim(),
      visits: [] as VisitRecord[],
      createdAtISO: now,
      updatedAtISO: now,
    }
    console.log('[clientsStore] upsertClient: creando...', payload)
    try {
      const ref = await addDoc(collection(db, CLIENTS_COLLECTION), payload)
      const created: ClientRecord = { id: ref.id, ...payload }
      clients.push(created)
      console.log('[clientsStore] upsertClient: creado id =', ref.id)
      return created
    } catch (e) {
      console.error('[clientsStore] upsertClient: error', e)
      throw e
    }
  }

  async function addVisit(clientId: string, dateISO: string, serviceKey: ServiceKey): Promise<VisitRecord | null> {
    const client = clients.find(c => c.id === clientId)
    if (!client) return null
    const visit: VisitRecord = { id: uid(), dateISO, serviceKey }
    const newVisits = [...client.visits, visit]
    const ref = doc(db, CLIENTS_COLLECTION, clientId)
    console.log('[clientsStore] addVisit: agregando visita', { clientId, visit })
    await updateDoc(ref, { visits: newVisits, updatedAtISO: new Date().toISOString() })
    console.log('[clientsStore] addVisit: OK')
    return visit
  }

  function getClientById(clientId: string) {
    return clients.find(c => c.id === clientId) || null
  }

  function getClientByDni(dni: string) {
    return clients.find(c => c.dni === dni.trim()) || null
  }

  async function findOrFetchByDni(dni: string) {
    console.log('[clientsStore] findOrFetchByDni:', dni)
    const local = getClientByDni(dni)
    if (local) {
      console.log('[clientsStore] findOrFetchByDni: encontrado local', local.id)
      return local
    }
    const q = query(collection(db, CLIENTS_COLLECTION), where('dni', '==', dni.trim()))
    const snap = await getDocs(q)
    console.log('[clientsStore] findOrFetchByDni: resultados', snap.size)
    if (snap.empty) return null
    const d = snap.docs[0]
    const found: ClientRecord = { id: d.id, ...(d.data() as Omit<ClientRecord, 'id'>) }
    if (!clients.find(c => c.id === found.id)) clients.push(found)
    return found
  }

  async function fetchById(id: string) {
    const local = getClientById(id)
    if (local) return local
    const ref = doc(db, CLIENTS_COLLECTION, id)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    const found: ClientRecord = { id: snap.id, ...(snap.data() as Omit<ClientRecord, 'id'>) }
    if (!clients.find(c => c.id === found.id)) clients.push(found)
    return found
  }

  function getDiscountStatus(clientId: string) {
    const c = getClientById(clientId)
    if (!c) return null
    return computeDiscountStatus(c.visits)
  }

  async function removeVisit(clientId: string, visitId: string) {
    const c = getClientById(clientId)
    if (!c) return
    const newVisits = c.visits.filter(v => v.id !== visitId)
    const ref = doc(db, CLIENTS_COLLECTION, clientId)
    console.log('[clientsStore] removeVisit: eliminando', { clientId, visitId })
    await updateDoc(ref, { visits: newVisits, updatedAtISO: new Date().toISOString() })
    console.log('[clientsStore] removeVisit: OK')
  }

  async function updateClient(clientId: string, fields: Partial<Pick<ClientRecord, 'firstName' | 'lastName' | 'dni'>>) {
    const ref = doc(db, CLIENTS_COLLECTION, clientId)
    const payload: any = { ...fields, updatedAtISO: new Date().toISOString() }
    await updateDoc(ref, payload)
    const c = getClientById(clientId)
    if (c) {
      if (fields.firstName !== undefined) c.firstName = fields.firstName.trim()
      if (fields.lastName !== undefined) c.lastName = fields.lastName.trim()
      if (fields.dni !== undefined) c.dni = fields.dni.trim()
      c.updatedAtISO = payload.updatedAtISO
    }
  }

  async function deleteClient(clientId: string) {
    await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId))
    const idx = clients.findIndex(c => c.id === clientId)
    if (idx !== -1) clients.splice(idx, 1)
  }

  return {
    clients,
    sortedClients,
    upsertClient,
    addVisit,
    getClientById,
    getClientByDni,
    findOrFetchByDni,
    getDiscountStatus,
    removeVisit,
    updateClient,
    deleteClient,
    fetchById,
  }
})