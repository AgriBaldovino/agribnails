import express from 'express'
import { listClients, getClient, createClient, addVisit, removeVisit } from '../controllers/clientsController'

const router = express.Router()

router.get('/', listClients)
router.get('/:id', getClient)
router.post('/', createClient)
router.post('/:id/visits', addVisit)
router.delete('/:id/visits/:visitId', removeVisit)

export default router

