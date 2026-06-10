const btnIngresar = document.getElementById('loginButton');
if (btnIngresar) {
  btnIngresar.addEventListener('click', evento => {
    evento.preventDefault();
    const correo = document.getElementById('usuarioLogin').value.trim();
    const password = document.getElementById('passwordLogin').value;

    if (!correo || !password) {
      return alert('Por favor, completa todos los campos.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return alert('Por favor ingresa un correo válido.');
    }

    alert(`Bienvenido, ${correo}`);
    document.getElementById('loginForm')?.submit();
  });
}

