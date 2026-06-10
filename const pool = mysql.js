const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'MiPasswordReal',
  database: 'mi_basededatos',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 5
});