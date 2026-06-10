
import flask

try:
    import mysql.connector as mysql_connector # pyright: ignore[reportMissingImports]
except ImportError:
    mysql_connector = None
    print('mysql.connector no está instalado. Instala mysql-connector-python.')

app = flask.Flask(__name__, template_folder='archivos', static_folder='static', static_url_path='/static')

conexion = None
cursor = None
if mysql_connector is not None:
    try:
        conexion = mysql_connector.connect(
            host='localhost',
            user='root',
            password='1234',
            database='miweb'
        )
        cursor = conexion.cursor()
        print('Conexion exitosa a MySQL')
        
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
        print('Tabla contactos verificada/creada')
        
    except mysql_connector.Error as error:
        print('Error al conectar con MySQL')
        print(error)


@app.route('/')
def inicio():
    return flask.render_template('index1.html')


@app.route('/crear')
def crear():
    return flask.render_template('CREAR.html')


@app.route('/registro', methods=['GET'])
def registro_get():
    return flask.redirect('/crear')

@app.route('/registro', methods=['POST'])
def registro():

    if cursor is None:
        return """
        <h1>Error: base de datos no disponible</h1>
        <a href='/crear'>Volver</a>
        """

    nombre = flask.request.form['nombre']
    correo = flask.request.form['correo']
    password = flask.request.form['password']

    sql = """
    INSERT INTO usuarios (nombre, correo, password)
    VALUES (%s, %s, %s)
    """

    valores = (nombre, correo, password)

    try:
        cursor.execute(sql, valores)
        conexion.commit()

        print('Usuario registrado')

        return flask.redirect('/')

    except mysql_connector.Error as error:
        print(error)

        return """
        <h1>Error al registrar usuario</h1>
        <a href="/crear">Volver</a>
        """


@app.route('/login', methods=['GET'])
def login_get():
    return flask.render_template('index1.html')


@app.route('/login', methods=['POST'])
def login():

    if cursor is None:
        return """
        <h1>Error: base de datos no disponible</h1>
        <a href="/">Volver al login</a>
        """

    correo = flask.request.form['correo']
    password = flask.request.form['password']

    sql = """
    SELECT * FROM usuarios
    WHERE correo = %s AND password = %s
    """

    valores = (correo, password)

    cursor.execute(sql, valores)

    usuario = cursor.fetchone()

    if usuario:
        return f"""
        <h1>Bienvenido {usuario[1]}</h1>
        <a href="/">Cerrar sesión</a>
        """
    else:
        return """
        <h1>Correo o contraseña incorrectos</h1>
        <a href="/">Volver al login</a>
        """


@app.route('/index')
def index_principal():
    return flask.render_template('index.html')


@app.route('/perfil')
def perfil():
    return flask.render_template('perfil.html')


@app.route('/proyectos')
def proyectos():
    return flask.render_template('proyectos.html')


@app.route('/educacion')
def educacion():
    return flask.render_template('educacion.html')


@app.route('/contactanos')
def contactanos():
    return flask.render_template('contactanos.html')


@app.route('/guardar_contacto', methods=['POST'])
def guardar_contacto():
    if cursor is None:
        return flask.jsonify({'success': False, 'error': 'Base de datos no disponible'}), 500

    nombre = flask.request.form.get('nombre', '')
    correo = flask.request.form.get('correo', '')
    telefono = flask.request.form.get('telefono', '')
    mensaje = flask.request.form.get('mensaje', '')

    if not nombre or not correo or not mensaje:
        return flask.jsonify({'success': False, 'error': 'Campos requeridos faltantes'}), 400

    sql = """
    INSERT INTO contactos (nombre, correo, telefono, mensaje)
    VALUES (%s, %s, %s, %s)
    """

    valores = (nombre, correo, telefono, mensaje)

    try:
        cursor.execute(sql, valores)
        conexion.commit()
        print(f'✓ Contacto guardado exitosamente: {nombre} - {correo}')
        return flask.jsonify({'success': True, 'message': 'Mensaje enviado correctamente'}), 201
    except mysql_connector.Error as error:
        print(f'✗ Error al guardar contacto: {error}')
        return flask.jsonify({'success': False, 'error': f'Error: {str(error)}'}), 500


@app.route('/ver_contactos')
def ver_contactos():
    """Ruta para ver todos los contactos guardados (solo para debug)"""
    if cursor is None:
        return {'error': 'Base de datos no disponible'}, 500

    try:
        cursor.execute("SELECT * FROM contactos ORDER BY fecha_creacion DESC;")
        contactos = cursor.fetchall()
        
        # Convertir a lista de diccionarios
        resultado = []
        for contacto in contactos:
            resultado.append({
                'id': contacto[0],
                'nombre': contacto[1],
                'correo': contacto[2],
                'telefono': contacto[3],
                'mensaje': contacto[4],
                'fecha': str(contacto[5])
            })
        
        return flask.jsonify({'total': len(resultado), 'contactos': resultado}), 200
    except mysql_connector.Error as error:
        print(f'Error al leer contactos: {error}')
        return flask.jsonify({'error': str(error)}), 500


@app.errorhandler(404)
def pagina_no_encontrada(error):
    return """
    <h1>Página no encontrada</h1>
    <p>La página que buscas no existe</p>
    <a href="/">Volver al inicio</a>
    """, 404


if __name__ == '__main__':
    app.run(debug=True)



