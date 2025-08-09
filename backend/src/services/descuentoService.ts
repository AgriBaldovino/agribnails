import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { Descuento } from '../types/descuento'

// Inicializar Firebase Admin solo si hay Service Account
const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
const serviceAccount = serviceAccountRaw ? JSON.parse(serviceAccountRaw) : null

if (!serviceAccount) {
  console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY no configurado, usando datos mock (descuentos)')
}

let db: Firestore | null = null
if (serviceAccount) {
  const app = getApps().length ? getApp() : initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || 'descuentos-app'
  })
  db = getFirestore(app)
}

export class DescuentoService {
  private collection = db ? db.collection('descuentos') : null

  async getAllDescuentos(): Promise<Descuento[]> {
    try {
      if (!serviceAccount || !this.collection) {
        // Datos mock para desarrollo/local sin credenciales
        return this.getMockDescuentos()
      }

      const snapshot = await this.collection.get()
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Descuento[]
    } catch (error) {
      console.error('Error al obtener descuentos de Firebase:', error)
      return this.getMockDescuentos()
    }
  }

  async getDescuentoById(id: string): Promise<Descuento | null> {
    try {
      if (!serviceAccount || !this.collection) {
        const mockDescuentos = this.getMockDescuentos()
        return mockDescuentos.find(d => d.id === id) || null
      }

      const doc = await this.collection.doc(id).get()
      if (!doc.exists) {
        return null
      }

      return {
        id: doc.id,
        ...doc.data()
      } as Descuento
    } catch (error) {
      console.error('Error al obtener descuento por ID:', error)
      return null
    }
  }

  async createDescuento(descuentoData: Omit<Descuento, 'id'>): Promise<Descuento> {
    try {
      if (!serviceAccount || !this.collection) {
        const nuevoDescuento: Descuento = {
          id: Date.now().toString(),
          ...descuentoData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        return nuevoDescuento
      }

      const docRef = await this.collection.add({
        ...descuentoData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      return {
        id: docRef.id,
        ...descuentoData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Descuento
    } catch (error) {
      console.error('Error al crear descuento:', error)
      throw error
    }
  }

  async updateDescuento(id: string, descuentoData: Partial<Descuento>): Promise<Descuento | null> {
    try {
      if (!serviceAccount || !this.collection) {
        // Mock update
        const mockDescuentos = this.getMockDescuentos()
        const index = mockDescuentos.findIndex(d => d.id === id)
        if (index === -1) return null

        mockDescuentos[index] = {
          ...mockDescuentos[index],
          ...descuentoData,
          updatedAt: new Date().toISOString()
        }
        return mockDescuentos[index]
      }

      await this.collection.doc(id).update({
        ...descuentoData,
        updatedAt: new Date().toISOString()
      })

      return this.getDescuentoById(id)
    } catch (error) {
      console.error('Error al actualizar descuento:', error)
      return null
    }
  }

  async deleteDescuento(id: string): Promise<boolean> {
    try {
      if (!serviceAccount || !this.collection) {
        // Mock delete
        const mockDescuentos = this.getMockDescuentos()
        const index = mockDescuentos.findIndex(d => d.id === id)
        return index !== -1
      }

      await this.collection.doc(id).delete()
      return true
    } catch (error) {
      console.error('Error al eliminar descuento:', error)
      return false
    }
  }

  private getMockDescuentos(): Descuento[] {
    return [
      {
        id: '1',
        titulo: 'Descuento en Electrónicos',
        descripcion: '20% de descuento en toda la línea de electrónicos',
        porcentaje: 20,
        categoria: 'Electrónicos',
        fechaInicio: '2024-01-01',
        fechaVencimiento: '2024-12-31',
        activo: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        titulo: 'Oferta en Ropa',
        descripcion: '15% de descuento en ropa para toda la familia',
        porcentaje: 15,
        categoria: 'Ropa',
        fechaInicio: '2024-01-01',
        fechaVencimiento: '2024-11-30',
        activo: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '3',
        titulo: 'Descuento en Hogar',
        descripcion: '25% de descuento en muebles y decoración',
        porcentaje: 25,
        categoria: 'Hogar',
        fechaInicio: '2024-01-01',
        fechaVencimiento: '2024-10-31',
        activo: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]
  }
} 