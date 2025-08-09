import { Request, Response } from 'express'
import { ClientsService } from '../services/clientsService'

const service = new ClientsService()

export async function listClients(req: Request, res: Response) {
  try {
    const data = await service.listClients()
    res.json({ success: true, data })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error al listar clientas' })
  }
}

export async function getClient(req: Request, res: Response) {
  try {
    const c = await service.getClient(req.params.id)
    if (!c) return res.status(404).json({ success: false, error: 'No encontrada' })
    res.json({ success: true, data: c })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error al obtener clienta' })
  }
}

export async function createClient(req: Request, res: Response) {
  try {
    const { firstName, lastName } = req.body
    if (!firstName || !lastName) return res.status(400).json({ success: false, error: 'Datos inválidos' })
    const c = await service.createClient(firstName, lastName)
    res.status(201).json({ success: true, data: c })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error al crear clienta' })
  }
}

export async function addVisit(req: Request, res: Response) {
  try {
    const { dateISO, serviceKey, id } = req.body
    if (!dateISO || !serviceKey || !req.params.id) {
      return res.status(400).json({ success: false, error: 'Datos inválidos' })
    }
    const visit = { id: id || Date.now().toString(36), dateISO, serviceKey }
    const updated = await service.addVisit(req.params.id, visit)
    if (!updated) return res.status(404).json({ success: false, error: 'Clienta no encontrada' })
    res.json({ success: true, data: updated })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error al agregar turno' })
  }
}

export async function removeVisit(req: Request, res: Response) {
  try {
    const ok = await service.removeVisit(req.params.id, req.params.visitId)
    if (!ok) return res.status(404).json({ success: false, error: 'Clienta o turno no encontrado' })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error al eliminar turno' })
  }
}

