import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDbkZjDHOYGmdqWw0oNSTh2Czlsxyn34bE',
  authDomain: 'agribnails.firebaseapp.com',
  projectId: 'agribnails',
  storageBucket: 'agribnails.firebasestorage.app',
  messagingSenderId: '1026492823352',
  appId: '1:1026492823352:web:153b6452c8cd91a00473cd',
  measurementId: 'G-H2SXPTS808',
}

// Initialize Firebase (evitar doble init)
export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Initialize Analytics si está soportado (evita error en entornos sin Analytics)
isSupported().then((ok) => {
  if (ok) getAnalytics(app)
})