import express from 'express';
import { getAllProjects, createNewProject, getProjectWithId, deleteProjectWithId, updateProject, getAllProjectsTEST, getProjectsMaps } from '../controllers/projects.js'

const router = express.Router();


router.get('/all', getAllProjects)
router.get('/allmaps', getProjectsMaps)
router.get('/alltest', getAllProjectsTEST)
router.get('/:id', getProjectWithId)
router.delete('/delete/:id', deleteProjectWithId)
router.patch('/update/:id', updateProject)

router.post('/new', createNewProject)

export default router;
