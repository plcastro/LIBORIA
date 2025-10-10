const mysql = require('mysql2');

// Create database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'Liboria'
});

// Connect to database
db.connect(err => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    process.exit(1); // Exit the process if connection fails
  }
  console.log('Connected to MySQL database');
});

// Export the connection
module.exports = db;