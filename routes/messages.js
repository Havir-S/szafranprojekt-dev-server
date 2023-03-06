import express from 'express';

import { getMessagesBySearch, getMessages, deleteMessage, getMessageById } from '../controllers/messages.js'


const router = express.Router();


router.get('/all', getMessages)
router.get('/search', getMessagesBySearch)
router.get('/:id', getMessageById)
router.delete('/:id', deleteMessage)


export default router;
