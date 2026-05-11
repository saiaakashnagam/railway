const db = require('../config/db');

exports.createTask = async (req, res) => {
  const { title, description, status, priority, due_date, project_id, assigned_to } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO tasks (title, description, status, priority, due_date, project_id, assigned_to) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, status || 'Todo', priority || 'Medium', due_date, project_id, assigned_to]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTasks = async (req, res) => {
  const { project_id } = req.query;
  try {
    let query = 'SELECT t.*, u.name as assigned_name FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id';
    let params = [];
    
    if (project_id) {
      query += ' WHERE t.project_id = $1';
      params.push(project_id);
    }
    
    query += ' ORDER BY t.created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, due_date, assigned_to } = req.body;
  
  try {
    // Check if task exists
    const taskRes = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (taskRes.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
    
    const task = taskRes.rows[0];
    
    // RBAC: Members can only update status and comment if they are not Admin
    // Admins can update everything
    if (req.user.role !== 'Admin' && (title || description || priority || due_date || assigned_to)) {
      // If a member tries to update restricted fields
      if (task.assigned_to !== req.user.id) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you' });
      }
    }

    const result = await db.query(
      `UPDATE tasks SET 
        title = COALESCE($1, title), 
        description = COALESCE($2, description), 
        status = COALESCE($3, status), 
        priority = COALESCE($4, priority), 
        due_date = COALESCE($5, due_date), 
        assigned_to = COALESCE($6, assigned_to) 
      WHERE id = $7 RETURNING *`,
      [title, description, status, priority, due_date, assigned_to, id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await db.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
