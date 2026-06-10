const http = require('http');
const fs = require('fs');
const path = require('path');
const pool = require('./conexion');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
};

// Crear tabla contactos al iniciar
async function crearTablaContactos() {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS contactos(
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        correo VARCHAR(100) NOT NULL,
        telefono VARCHAR(20),
        mensaje TEXT NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.execute(sql);
    console.log('✓ Tabla contactos verificada/creada');
  } catch (error) {
    console.error('✗ Error al crear tabla contactos:', error);
  }
}

crearTablaContactos();

function sendFile(res, filePath) {
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Archivo no encontrado');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  
  console.log(`${req.method} ${url}`);

  if (req.method === 'GET') {
    if (url === '/' || url === '/index' || url === '/index.html') {
      return sendFile(res, path.join(__dirname, 'archivos', 'index.html'));
    }

    if (url === '/login' || url === '/index1.html') {
      return sendFile(res, path.join(__dirname, 'archivos', 'index1.html'));
    }

    if (url === '/CREAR.html' || url === '/crear') {
      return sendFile(res, path.join(__dirname, 'archivos', 'CREAR.html'));
    }

    if (url === '/contactanos' || url === '/contactanos.html') {
      return sendFile(res, path.join(__dirname, 'archivos', 'contactanos.html'));
    }

    if (url === '/ver_contactos') {
      try {
        const [contactos] = await pool.query('SELECT * FROM contactos ORDER BY fecha_creacion DESC');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ total: contactos.length, contactos }));
      } catch (error) {
        console.error('Error al obtener contactos:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Error al obtener contactos' }));
      }
    }

    if (url.startsWith('/static/')) {
      const filePath = path.join(__dirname, url.slice(1));
      return sendFile(res, filePath);
    }

    const rootFile = path.join(__dirname, url.slice(1));
    if ((url.endsWith('.css') || url.endsWith('.avif') || url.endsWith('.html')) && fs.existsSync(rootFile)) {
      return sendFile(res, rootFile);
    }

    const archivosFile = path.join(__dirname, 'archivos', url.slice(1));
    if ((url.endsWith('.css') || url.endsWith('.avif') || url.endsWith('.html')) && fs.existsSync(archivosFile)) {
      return sendFile(res, archivosFile);
    }

    if (url === '/usuarios') {
      try {
        const [filas] = await pool.query('SELECT * FROM usuarios');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(filas));
      } catch (error) {
        console.error('Error en la base de datos:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Error al obtener los datos' }));
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Ruta GET no encontrada');
  }

  if (req.method === 'POST') {
    if (url === '/registro' || url === '/registro/') {
      try {
        const body = await parseRequestBody(req);
        const params = new URLSearchParams(body);
        const nombre = params.get('nombre');
        const correo = params.get('correo');
        const password = params.get('password');
        const password2 = params.get('password2');

        if (!nombre || !correo || !password || !password2) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          return res.end('Faltan datos en el formulario');
        }

        if (password !== password2) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          return res.end('Las contraseñas no coinciden');
        }
        const sql = 'INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)';
        await pool.execute(sql, [nombre, correo, password]);

        res.writeHead(303, { Location: '/login' });
        return res.end();
      } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Error al registrar usuario');
      }
    }

    if (url === '/login' || url === '/login/') {
      try {
        const body = await parseRequestBody(req);
        const params = new URLSearchParams(body);
        const correo = params.get('correo');
        const password = params.get('password');

        const sql = 'SELECT * FROM usuarios WHERE correo = ? AND password = ?';
        const [rows] = await pool.execute(sql, [correo, password]);

        if (rows.length > 0) {
          res.writeHead(303, { Location: '/' });
          return res.end();
        }

        res.writeHead(401, { 'Content-Type': 'text/html' });
        return res.end('<h1>Correo o contraseña incorrectos</h1><a href="/">Volver al login</a>');
      } catch (error) {
        console.error('Error en login:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Error al iniciar sesión');
      }
    }

    if (url === '/guardar_contacto' || url === '/guardar_contacto/') {
      try {
        const body = await parseRequestBody(req);
        console.log('📨 Body recibido:', body);
        
        const params = new URLSearchParams(body);
        const nombre = params.get('nombre');
        const correo = params.get('correo');
        const telefono = params.get('telefono') || '';
        const mensaje = params.get('mensaje');

        console.log('📋 Datos parseados:', { nombre, correo, telefono, mensaje });

        if (!nombre || !correo || !mensaje) {
          console.log('❌ Faltam datos:', { nombre: !!nombre, correo: !!correo, mensaje: !!mensaje });
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ 
            success: false, 
            error: 'Campos requeridos faltantes' 
          }));
        }

        const sql = 'INSERT INTO contactos (nombre, correo, telefono, mensaje) VALUES (?, ?, ?, ?)';
        await pool.execute(sql, [nombre, correo, telefono, mensaje]);

        console.log(`✓ Contacto guardado: ${nombre} - ${correo}`);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ 
          success: true, 
          message: 'Mensaje enviado correctamente' 
        }));
      } catch (error) {
        console.error('Error al guardar contacto:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ 
          success: false, 
          error: error.message 
        }));
      }
    }
  }

  res.writeHead(405, { 'Content-Type': 'text/plain' });
  res.end('Método no permitido');
});

server.listen(3000, () => {
  console.log('Servidor NATIVO corriendo en http://localhost:3000');
});
