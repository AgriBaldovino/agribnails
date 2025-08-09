import * as functions from 'firebase-functions'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

// Inicializa Admin SDK (usa credenciales por defecto de Functions)
initializeApp()
const db = getFirestore()

// App Express
const app = express()

app.use(helmet())
app.use(cors({ origin: true, credentials: true }))
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
app.use(limiter)

// Endpoints de clientas (mínimos)
const COLLECTION = 'clients'

app.get('/api/clients', async (_req, res) => {
  const snap = await db.collection(COLLECTION).get()
  const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as Record<string, unknown>) }))
  res.json({ success: true, data })
})

app.get('/api/clients/:id', async (req, res) => {
  const doc = await db.collection(COLLECTION).doc(req.params.id).get()
  if (!doc.exists) return res.status(404).json({ success: false, error: 'No encontrada' })
  res.json({ success: true, data: { id: doc.id, ...(doc.data() as Record<string, unknown>) } })
})

app.post('/api/clients', async (req, res) => {
  const { firstName, lastName } = req.body || {}
  if (!firstName || !lastName) return res.status(400).json({ success: false, error: 'Datos inválidos' })
  const now = new Date().toISOString()
  const payload = { firstName: String(firstName).trim(), lastName: String(lastName).trim(), visits: [], createdAtISO: now, updatedAtISO: now }
  const ref = await db.collection(COLLECTION).add(payload)
  res.status(201).json({ success: true, data: { id: ref.id, ...payload } })
})

app.post('/api/clients/:id/visits', async (req, res) => {
  const { id } = req.params
  const { dateISO, serviceKey, vid } = req.body || {}
  if (!dateISO || !serviceKey) return res.status(400).json({ success: false, error: 'Datos inválidos' })
  const ref = db.collection(COLLECTION).doc(id)
  const doc = await ref.get()
  if (!doc.exists) return res.status(404).json({ success: false, error: 'Clienta no encontrada' })
  const data = doc.data() as any
  const visit = { id: vid || Date.now().toString(36), dateISO, serviceKey }
  const visits = [...(data.visits || []), visit]
  const updatedAtISO = new Date().toISOString()
  await ref.update({ visits, updatedAtISO })
  res.json({ success: true, data: { id: doc.id, ...data, visits, updatedAtISO } })
})

app.delete('/api/clients/:id/visits/:visitId', async (req, res) => {
  const ref = db.collection(COLLECTION).doc(req.params.id)
  const doc = await ref.get()
  if (!doc.exists) return res.status(404).json({ success: false, error: 'Clienta no encontrada' })
  const data = doc.data() as any
  const visits = (data.visits || []).filter((v: any) => v.id === undefined || v.id !== req.params.visitId)
  const updatedAtISO = new Date().toISOString()
  await ref.update({ visits, updatedAtISO })
  res.json({ success: true })
})

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', env: 'functions' })
})

export const api = functions.https.onRequest(app)


