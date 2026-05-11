const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const initDb = require('./initDb');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize Database
initDb();

// Routes (to be added)
app.get('/', (req, res) => {
  res.send('Team Task Manager API is running...');
});

// Auth Routes
app.use('/api/auth', require('./routes/authRoutes'));
// Project Routes
app.use('/api/projects', require('./routes/projectRoutes'));
// Task Routes
app.use('/api/tasks', require('./routes/taskRoutes'));
// Comment Routes
app.use('/api/comments', require('./routes/commentRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
