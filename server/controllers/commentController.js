const db = require('../config/db');

exports.addComment = async (req, res) => {
  const { content, task_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO comments (content, task_id, user_id) VALUES ($1, $2, $3) RETURNING *',
      [content, task_id, req.user.id]
    );
    
    // Fetch comment with user name
    const commentWithUser = await db.query(`
      SELECT c.*, u.name as user_name 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.id = $1
    `, [result.rows[0].id]);
    
    res.status(201).json(commentWithUser.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCommentsByTask = async (req, res) => {
  const { task_id } = req.params;
  try {
    const result = await db.query(`
      SELECT c.*, u.name as user_name 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.task_id = $1 
      ORDER BY c.created_at ASC
    `, [task_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
