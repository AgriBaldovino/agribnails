import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { db } from '../firebase'
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore'
import type { PriceItem } from '../data/prices'
import { PRICE_CORE, PRICE_ADDONS, PRICE_REMOVAL } from '../data/prices'

export interface PricesState {
  core: PriceItem[]
  addons: PriceItem[]
  removal: PriceItem[]
}

const DEFAULT_PRICES: PricesState = {
  core: PRICE_CORE,
  addons: PRICE_ADDONS,
  removal: PRICE_REMOVAL,
}

export const usePricesStore = defineStore('prices', () => {
  // Inicializar con defaults para que el diálogo no aparezca vacío
  const state = reactive<PricesState>({ ...DEFAULT_PRICES })

  const ref = doc(db, 'settings', 'prices')

  // Suscripción en tiempo real
  onSnapshot(ref, async (snap) => {
    if (!snap.exists()) {
      // Seed inicial si no existe
      await setDoc(ref, { ...DEFAULT_PRICES, updatedAtISO: new Date().toISOString() }, { merge: true })
      Object.assign(state, DEFAULT_PRICES)
      console.log('[pricesStore] onSnapshot: seeded defaults')
      return
    }
    const data = snap.data() as PricesState
    state.core = data.core && data.core.length ? data.core : DEFAULT_PRICES.core
    state.addons = data.addons && data.addons.length ? data.addons : DEFAULT_PRICES.addons
    state.removal = data.removal && data.removal.length ? data.removal : DEFAULT_PRICES.removal
    console.log('[pricesStore] onSnapshot: applied', {
      core: state.core.length,
      addons: state.addons.length,
      removal: state.removal.length,
    })
  }, (err) => {
    console.error('[pricesStore] onSnapshot error', err)
  })

  async function loadOnce() {
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const data = snap.data() as PricesState
      state.core = data.core && data.core.length ? data.core : DEFAULT_PRICES.core
      state.addons = data.addons && data.addons.length ? data.addons : DEFAULT_PRICES.addons
      state.removal = data.removal && data.removal.length ? data.removal : DEFAULT_PRICES.removal
    } else {
      await setDoc(ref, { ...DEFAULT_PRICES, updatedAtISO: new Date().toISOString() }, { merge: true })
      Object.assign(state, DEFAULT_PRICES)
    }
  }

  async function updatePrices(prices: PricesState) {
    const payload: PricesState & { updatedAtISO: string } = {
      core: prices.core.map(p => ({ label: p.label, price: Number(p.price) })),
      addons: prices.addons.map(p => ({ label: p.label, price: Number(p.price) })),
      removal: prices.removal.map(p => ({ label: p.label, price: Number(p.price) })),
      updatedAtISO: new Date().toISOString(),
    }
    console.log('[pricesStore] updatePrices payload', payload)
    await setDoc(ref, payload, { merge: true })
    console.log('[pricesStore] updatePrices done')
  }

  return {
    state,
    loadOnce,
    updatePrices,
  }
})


