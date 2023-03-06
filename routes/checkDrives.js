
import express from 'express'
import {checkDrives, checkDriveId } from '../controllers/drives.js'

const router = express.Router();

router.get('/', checkDrives)
router.get('/:id', checkDriveId)

export default router;
