import express from 'express'

import {downloadOne} from '../controllers/downloads.js'
const router = express.Router()

router.get('/',downloadOne)

export default router