import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import type { ClientRecord, VisitRecord } from '../types/client'
import { readJson, writeJson } from '../utils/fileStore'

function getDb(): Firestore | null {
  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  const serviceAccount = serviceAccountRaw ? JSON.parse(serviceAccountRaw) : null

  if (!serviceAccount) {
    console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY no configurado, usando modo sin persistencia (clients)')
    return null
  }

  const app = getApps().length
    ? getApp()
    : initializeApp({ credential: cert(serviceAccount), projectId: process.env.FIREBASE_PROJECT_ID })

  return getFirestore(app)
}

const COLLECTION = 'clients'

export class ClientsService {
  private db: Firestore | null

  constructor() {
    this.db = getDb()
  }

  async listClients(): Promise<ClientRecord[]> {
    if (!this.db) {
      return await readJson<ClientRecord[]>(`clients.json`, [])
    }
    const snap = await this.db.collection(COLLECTION).get()
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<ClientRecord, 'id'>) }))
  }

  async getClient(id: string): Promise<ClientRecord | null> {
    if (!this.db) {
      const list = await readJson<ClientRecord[]>(`clients.json`, [])
      return list.find(c => c.id === id) || null
    }
    const doc = await this.db.collection(COLLECTION).doc(id).get()
    if (!doc.exists) return null
    return { id: doc.id, ...(doc.data() as Omit<ClientRecord, 'id'>) }
  }

  async createClient(firstName: string, lastName: string): Promise<ClientRecord> {
    if (!this.db) {
      const now = new Date().toISOString()
      const list = await readJson<ClientRecord[]>(`clients.json`, [])
      const created: ClientRecord = {
        id: Date.now().toString(36),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        visits: [],
        createdAtISO: now,
        updatedAtISO: now,
      }
      list.push(created)
      await writeJson(`clients.json`, list)
      return created
    }
    const now = new Date().toISOString()
    const payload: Omit<ClientRecord, 'id'> = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      visits: [],
      createdAtISO: now,
      updatedAtISO: now,
    }
    const ref = await this.db.collection(COLLECTION).add(payload)
    return { id: ref.id, ...payload }
  }

  async addVisit(clientId: string, visit: VisitRecord): Promise<ClientRecord | null> {
    if (!this.db) {
      const list = await readJson<ClientRecord[]>(`clients.json`, [])
      const idx = list.findIndex(c => c.id === clientId)
      if (idx === -1) return null
      const next = { ...list[idx] }
      next.visits = [...(next.visits || []), visit]
      next.updatedAtISO = new Date().toISOString()
      list[idx] = next
      await writeJson(`clients.json`, list)
      return next
    }
    const ref = this.db.collection(COLLECTION).doc(clientId)
    const doc = await ref.get()
    if (!doc.exists) return null
    const data = doc.data() as Omit<ClientRecord, 'id'>
    const newVisits = [...(data.visits || []), visit]
    const updatedAtISO = new Date().toISOString()
    await ref.update({ visits: newVisits, updatedAtISO })
    return { id: doc.id, ...data, visits: newVisits, updatedAtISO }
  }

  async removeVisit(clientId: string, visitId: string): Promise<boolean> {
    if (!this.db) {
      const list = await readJson<ClientRecord[]>(`clients.json`, [])
      const idx = list.findIndex(c => c.id === clientId)
      if (idx === -1) return false
      const next = { ...list[idx] }
      next.visits = (next.visits || []).filter(v => v.id !== visitId)
      next.updatedAtISO = new Date().toISOString()
      list[idx] = next
      await writeJson(`clients.json`, list)
      return true
    }
    const ref = this.db.collection(COLLECTION).doc(clientId)
    const doc = await ref.get()
    if (!doc.exists) return false
    const data = doc.data() as Omit<ClientRecord, 'id'>
    const newVisits = (data.visits || []).filter(v => v.id !== visitId)
    const updatedAtISO = new Date().toISOString()
    await ref.update({ visits: newVisits, updatedAtISO })
    return true
  }
}

