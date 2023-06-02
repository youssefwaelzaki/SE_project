const fs = require('fs');
const db = require('./db'); 

// Read the SQL script file
const sqlScript = fs.readFileSync('scripts.sql', 'utf8');

// Execute the SQL script using Knex
db.raw(sqlScript)
  .then(() => {
    console.log('Tables created successfully.');
  })
  .catch((error) => {
    console.error('Error creating tables:', error);
  });
