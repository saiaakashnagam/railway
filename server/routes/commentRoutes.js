const express = require('express');
const router = express.Router();
const { addComment, getCommentsByTask } = require('../controllers/commentController');
const { auth } = require('../middleware/authMiddleware');

router.get('/:task_id', auth, getCommentsByTask);
router.post('/', auth, addComment);

module.exports = router;
