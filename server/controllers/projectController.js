const db = require('../config/db');

exports.createProject = async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    let result;
    if (req.user.role === 'Admin') {
      result = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
    } else {
      // Members only see projects where they have tasks assigned or projects they are part of
      // For simplicity, let's say they see all projects but can only edit tasks assigned to them
      // Or we can filter projects that have tasks assigned to them
      result = await db.query(`
        SELECT DISTINCT p.* FROM projects p
        LEFT JOIN tasks t ON p.id = t.project_id
        WHERE p.owner_id = $1 OR t.assigned_to = $1
      `, [req.user.id]);
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Project not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await db.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
