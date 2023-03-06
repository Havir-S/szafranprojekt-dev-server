import express from 'express';
import { createNewClient, getAllClients, getAllClientsNamesOnly, deleteClient, updateClient } from '../controllers/clients.js'

const router = express.Router();

router.get('/all', getAllClients)
router.get('/all/namesonly', getAllClientsNamesOnly)
router.post('/new', createNewClient)
router.delete('/delete/:id', deleteClient)
router.patch('/update/:id', updateClient)

export default router;
