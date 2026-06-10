#!/usr/bin/env python3
"""
Script para crear la tabla de contactos en la BD si no existe
Ejecutar: python setup_bd.py
"""

try:
    import mysql.connector
except ImportError:
    print('mysql.connector no está instalado. Instala mysql-connector-python.')
    exit(1)

try:
    # Conectar a MySQL
    conexion = mysql.connector.connect(
        host='localhost',
        user='root',
        password='1234',
        database='miweb'
    )
    cursor = conexion.cursor()
    print('✓ Conexión exitosa a MySQL')
    
    # Crear tabla contactos si no existe
    sql_crear_tabla = """
    CREATE TABLE IF NOT EXISTS contactos(
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        correo VARCHAR(100) NOT NULL,
        telefono VARCHAR(20),
        mensaje TEXT NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    cursor.execute(sql_crear_tabla)
    conexion.commit()
    print('✓ Tabla contactos creada o verificada')
    
    # Mostrar las tablas
    cursor.execute("SHOW TABLES;")
    tablas = cursor.fetchall()
    print('\nTablas en la BD:')
    for tabla in tablas:
        print(f'  - {tabla[0]}')
    
    # Describir la tabla contactos
    cursor.execute("DESCRIBE contactos;")
    print('\nEstructura de contactos:')
    for fila in cursor.fetchall():
        print(f'  {fila}')
    
    cursor.close()
    conexion.close()
    print('\n✓ Configuración completada correctamente')
    
except mysql.connector.Error as error:
    print(f'✗ Error de MySQL: {error}')
    exit(1)
except Exception as error:
    print(f'✗ Error: {error}')
    exit(1)
