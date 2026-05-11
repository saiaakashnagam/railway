const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, deleteProject } = require('../controllers/projectController');
const { auth, authorize } = require('../middleware/authMiddleware');

router.get('/', auth, getProjects);
router.get('/:id', auth, getProjectById);
router.post('/', auth, authorize('Admin'), createProject);
router.delete('/:id', auth, authorize('Admin'), deleteProject);

module.exports = router;
