const mysql = require('mysql2/promise'); // Conector en versión de promesas

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234', // Cambia esto si tu contraseña es otra
  database: 'miweb',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 5
});

module.exports = pool;
