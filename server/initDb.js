const { pool } = require('./config/db');
const fs = require('fs');
const path = require('path');

const initDb = async () => {
  if (process.env.MOCK_DB === 'true') {
    console.log('Using Mock Database - skipping table initialization');
    return;
  }
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'models', 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

module.exports = initDb;
