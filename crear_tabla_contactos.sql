-- Script para crear la tabla de contactos
-- Ejecutar esto en MySQL si la tabla no existe

USE miweb;

-- Crear tabla contactos si no existe
CREATE TABLE IF NOT EXISTS contactos(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    mensaje TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mostrar las tablas para verificar
SHOW TABLES;

-- Ver la estructura de la tabla contactos
DESCRIBE contactos;
