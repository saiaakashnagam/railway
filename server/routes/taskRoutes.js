const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask, getUsers } = require('../controllers/taskController');
const { auth, authorize } = require('../middleware/authMiddleware');

router.get('/', auth, getTasks);
router.get('/users', auth, getUsers); // Helper to get users for assignment
router.post('/', auth, authorize('Admin'), createTask);
router.patch('/:id', auth, updateTask); // Members can update status
router.delete('/:id', auth, authorize('Admin'), deleteTask);

module.exports = router;
