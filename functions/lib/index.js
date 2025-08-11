"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Inicializa Admin SDK (usa credenciales por defecto de Functions)
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
// App Express
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
const limiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);
// Endpoints de clientas (mínimos)
const COLLECTION = 'clients';
app.get('/api/clients', async (_req, res) => {
    const snap = await db.collection(COLLECTION).get();
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ success: true, data });
});
app.get('/api/clients/:id', async (req, res) => {
    const doc = await db.collection(COLLECTION).doc(req.params.id).get();
    if (!doc.exists)
        return res.status(404).json({ success: false, error: 'No encontrada' });
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
});
app.post('/api/clients', async (req, res) => {
    const { firstName, lastName } = req.body || {};
    if (!firstName || !lastName)
        return res.status(400).json({ success: false, error: 'Datos inválidos' });
    const now = new Date().toISOString();
    const payload = { firstName: String(firstName).trim(), lastName: String(lastName).trim(), visits: [], createdAtISO: now, updatedAtISO: now };
    const ref = await db.collection(COLLECTION).add(payload);
    res.status(201).json({ success: true, data: { id: ref.id, ...payload } });
});
app.post('/api/clients/:id/visits', async (req, res) => {
    const { id } = req.params;
    const { dateISO, serviceKey, vid } = req.body || {};
    if (!dateISO || !serviceKey)
        return res.status(400).json({ success: false, error: 'Datos inválidos' });
    const ref = db.collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists)
        return res.status(404).json({ success: false, error: 'Clienta no encontrada' });
    const data = doc.data();
    const visit = { id: vid || Date.now().toString(36), dateISO, serviceKey };
    const visits = [...(data.visits || []), visit];
    const updatedAtISO = new Date().toISOString();
    await ref.update({ visits, updatedAtISO });
    res.json({ success: true, data: { id: doc.id, ...data, visits, updatedAtISO } });
});
app.delete('/api/clients/:id/visits/:visitId', async (req, res) => {
    const ref = db.collection(COLLECTION).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists)
        return res.status(404).json({ success: false, error: 'Clienta no encontrada' });
    const data = doc.data();
    const visits = (data.visits || []).filter((v) => v.id === undefined || v.id !== req.params.visitId);
    const updatedAtISO = new Date().toISOString();
    await ref.update({ visits, updatedAtISO });
    res.json({ success: true });
});
// Función para crear índices de Firestore
app.post('/api/setup-indexes', async (_req, res) => {
    try {
        console.log('Iniciando creación de índices...');
        // Crear índice para slots (fecha + hora)
        const slotsIndex = {
            collectionGroup: 'slots',
            queryScope: 'COLLECTION',
            fields: [
                { fieldPath: 'fecha', order: 'ASCENDING' },
                { fieldPath: 'hora', order: 'ASCENDING' }
            ]
        };
        // Crear índice para bookings (fecha + hora)
        const bookingsIndex = {
            collectionGroup: 'bookings',
            queryScope: 'COLLECTION',
            fields: [
                { fieldPath: 'fecha', order: 'ASCENDING' },
                { fieldPath: 'hora', order: 'ASCENDING' }
            ]
        };
        // Crear los índices usando la API de Firestore
        const [slotsResult] = await db.collection('slots').createIndex(slotsIndex);
        const [bookingsResult] = await db.collection('bookings').createIndex(bookingsIndex);
        console.log('Índices creados exitosamente:', { slotsResult, bookingsResult });
        res.json({
            success: true,
            message: 'Índices creados exitosamente',
            slotsIndex: slotsResult,
            bookingsIndex: bookingsResult
        });
    }
    catch (error) {
        console.error('Error al crear índices:', error);
        // Si el índice ya existe, no es un error
        if (error.code === 10) { // ALREADY_EXISTS
            res.json({
                success: true,
                message: 'Los índices ya existen',
                error: error.message
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Error al crear índices',
                details: error.message
            });
        }
    }
});
// Health
app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', env: 'functions' });
});
exports.api = functions.https.onRequest(app);
