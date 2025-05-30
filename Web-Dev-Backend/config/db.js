const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10
});

// Test de connexion
pool.getConnection()
  .then(conn => {
    console.log('Connecté à la base de données');
    conn.release();
  })
  .catch(err => {
    console.error('Erreur de connexion DB:', err);
  });

module.exports = pool;