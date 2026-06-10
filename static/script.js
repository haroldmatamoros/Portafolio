// Menú Hamburguesa
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.getElementById('hamburger');
  const menuContent = document.getElementById('menuContent');
  const menuLinks = menuContent.querySelectorAll('a');

  // Abrir/cerrar menú al hacer click en el botón hamburguesa
  hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('active');
    menuContent.classList.toggle('active');
  });

  // Cerrar menú cuando se hace click en un enlace
  menuLinks.forEach(link => {
    link.addEventListener('click', function() {
      hamburger.classList.remove('active');
      menuContent.classList.remove('active');
    });
  });

  // Cerrar menú cuando se hace click fuera de él
  document.addEventListener('click', function(event) {
    if (!event.target.closest('nav')) {
      hamburger.classList.remove('active');
      menuContent.classList.remove('active');
    }
  });

  // Formulario de contacto
  const formularioContacto = document.getElementById('formularioContacto');
  if (formularioContacto) {
    formularioContacto.addEventListener('submit', function(e) {
      e.preventDefault();

      const nombre = document.getElementById('nombre').value;
      const correo = document.getElementById('correo').value;
      const telefono = document.getElementById('telefono').value;
      const mensaje = document.getElementById('mensaje').value;
      const btnEnviar = document.getElementById('btnEnviar');
      const mensajeRespuesta = document.getElementById('mensaje-respuesta');

      btnEnviar.disabled = true;
      btnEnviar.textContent = 'Enviando...';
      mensajeRespuesta.className = 'mensaje-respuesta';
      mensajeRespuesta.textContent = '';

      // Usar URLSearchParams en lugar de FormData
      const params = new URLSearchParams();
      params.append('nombre', nombre);
      params.append('correo', correo);
      params.append('telefono', telefono);
      params.append('mensaje', mensaje);

      fetch('/guardar_contacto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      })
      .then(response => response.json())
      .then(data => {
        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Enviar Mensaje';

        if (data.success) {
          mensajeRespuesta.className = 'mensaje-respuesta exito';
          mensajeRespuesta.textContent = '✓ ' + data.message;
          formularioContacto.reset();
          setTimeout(() => {
            mensajeRespuesta.textContent = '';
          }, 5000);
        } else {
          mensajeRespuesta.className = 'mensaje-respuesta error';
          mensajeRespuesta.textContent = '✗ ' + data.error;
        }
      })
      .catch(error => {
        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Enviar Mensaje';
        mensajeRespuesta.className = 'mensaje-respuesta error';
        mensajeRespuesta.textContent = '✗ Error al enviar el mensaje';
        console.error('Error:', error);
      });
    });
  }
});
