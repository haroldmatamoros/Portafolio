const formCrear = document.getElementById('registroForm');
if (formCrear) {
  formCrear.addEventListener('submit', e => {
    e.preventDefault();
    const nombre = document.getElementById('registerName').value.trim();
    const correo = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const password2 = document.getElementById('registerPassword2').value;

    if (!nombre || !correo || !password || !password2) {
      return alert('Por favor completa todos los campos.');
    }
    if (nombre.length < 3) {
      return alert('El nombre debe tener al menos 3 caracteres.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return alert('Por favor ingresa un correo válido.');
    }
    if (password.length < 4) {
      return alert('La contraseña debe tener al menos 4 caracteres.');
    }
    if (password !== password2) {
      return alert('Las contraseñas no coinciden.');
    }

    alert(`Cuenta creada, ${nombre}.`);
    formCrear.submit();
  });
}
