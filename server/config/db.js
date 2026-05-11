require('dotenv').config();

// In-memory data store
let store = {
  users: [
    { id: 1, name: 'Admin User', email: 'admin@example.com', password: '$2a$10$XoN7lM9Zk.x0v6oO2uK1.O.8X2rX1u1.8X2rX1u1.8X2rX1u1.', role: 'Admin' }, // password: password123
    { id: 2, name: 'Member User', email: 'member@example.com', password: '$2a$10$XoN7lM9Zk.x0v6oO2uK1.O.8X2rX1u1.8X2rX1u1.8X2rX1u1.', role: 'Member' }
  ],
  projects: [
    { id: 1, name: 'Sample Project', description: 'This is a sample project for testing the UI.', owner_id: 1, created_at: new Date() }
  ],
  tasks: [
    { id: 1, title: 'Setup Project', description: 'Initialize the codebase and setup folders.', status: 'Done', priority: 'High', due_date: new Date(), project_id: 1, assigned_to: 1, created_at: new Date() },
    { id: 2, title: 'Design UI', description: 'Create mockups for the dashboard.', status: 'In Progress', priority: 'Medium', due_date: new Date(), project_id: 1, assigned_to: 2, created_at: new Date() },
    { id: 3, title: 'Implement Auth', description: 'Add JWT authentication to the backend.', status: 'Todo', priority: 'High', due_date: new Date(), project_id: 1, assigned_to: 1, created_at: new Date() }
  ],
  comments: []
};

let nextIds = { users: 3, projects: 2, tasks: 4, comments: 1 };

const mockQuery = async (text, params = []) => {
  console.log('Mock Query:', text, params);
  
  // Basic query parsing for common patterns
  const lowerText = text.toLowerCase();
  
  // USERS
  if (lowerText.includes('select * from users where email =')) {
    const email = params[0];
    return { rows: store.users.filter(u => u.email === email) };
  }
  if (lowerText.includes('select id, name, email, role from users where id =')) {
    const id = params[0];
    return { rows: store.users.filter(u => u.id == id) };
  }
  if (lowerText.includes('select id, name, email, role from users')) {
    return { rows: store.users };
  }
  if (lowerText.includes('insert into users')) {
    const newUser = { id: nextIds.users++, name: params[0], email: params[1], password: params[2], role: params[3] || 'Member', created_at: new Date() };
    store.users.push(newUser);
    return { rows: [newUser] };
  }

  // PROJECTS
  if (lowerText.includes('select * from projects order by created_at desc')) {
    return { rows: [...store.projects].reverse() };
  }
  if (lowerText.includes('select distinct p.* from projects p')) {
    const userId = params[0];
    // Simple filter: projects owned by user or projects where user has tasks
    const userTasks = store.tasks.filter(t => t.assigned_to == userId);
    const projIds = new Set(userTasks.map(t => t.project_id));
    return { rows: store.projects.filter(p => p.owner_id == userId || projIds.has(p.id)) };
  }
  if (lowerText.includes('select * from projects where id =')) {
    return { rows: store.projects.filter(p => p.id == params[0]) };
  }
  if (lowerText.includes('insert into projects')) {
    const newProj = { id: nextIds.projects++, name: params[0], description: params[1], owner_id: params[2], created_at: new Date() };
    store.projects.push(newProj);
    return { rows: [newProj] };
  }

  // TASKS
  if (lowerText.includes('select t.*, u.name as assigned_name from tasks t')) {
    const projectId = params[0];
    let filteredTasks = projectId ? store.tasks.filter(t => t.project_id == projectId) : store.tasks;
    const rows = filteredTasks.map(t => {
      const user = store.users.find(u => u.id == t.assigned_to);
      return { ...t, assigned_name: user ? user.name : 'Unassigned' };
    });
    return { rows };
  }
  if (lowerText.includes('insert into tasks')) {
    const newTask = { 
      id: nextIds.tasks++, 
      title: params[0], 
      description: params[1], 
      status: params[2], 
      priority: params[3], 
      due_date: params[4], 
      project_id: params[5], 
      assigned_to: params[6],
      created_at: new Date() 
    };
    store.tasks.push(newTask);
    return { rows: [newTask] };
  }
  if (lowerText.includes('update tasks set')) {
    const id = params[params.length - 1];
    const taskIndex = store.tasks.findIndex(t => t.id == id);
    if (taskIndex !== -1) {
      // Very simple update logic (just check status for demo)
      if (text.includes('status = coalesce($3, status)')) {
        if (params[2]) store.tasks[taskIndex].status = params[2];
      }
      return { rows: [store.tasks[taskIndex]] };
    }
  }

  // COMMENTS
  if (lowerText.includes('insert into comments')) {
    const newComment = { id: nextIds.comments++, content: params[0], task_id: params[1], user_id: params[2], created_at: new Date() };
    store.comments.push(newComment);
    return { rows: [newComment] };
  }
  if (lowerText.includes('select c.*, u.name as user_name from comments c')) {
    const taskId = params[0];
    const filtered = store.comments.filter(c => c.task_id == taskId);
    const rows = filtered.map(c => {
      const user = store.users.find(u => u.id == c.user_id);
      return { ...c, user_name: user ? user.name : 'Unknown' };
    });
    return { rows };
  }

  return { rows: [] };
};

// Toggle between real and mock
if (process.env.MOCK_DB === 'true') {
  module.exports = {
    query: mockQuery,
    pool: { query: mockQuery, on: () => {} }
  };
} else {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  pool.on('connect', () => console.log('Connected to the database'));
  module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
  };
}
