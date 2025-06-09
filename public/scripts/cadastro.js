document.getElementById('submit').addEventListener('click', async (e) => {
  e.preventDefault();

  const nome = document.querySelector('input[placeholder="nome"]').value.trim();
  const email = document.querySelector('input[type="email"]').value.trim();
  const senha = document.querySelector('input[type="password"]').value;
  const perfil = document.getElementById('perfil').value;

  if (!nome || !email || !senha || !perfil) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos obrigatórios',
      text: 'Por favor, preencha todos os campos.',
      confirmButtonColor: '#bf1b1b',
      color: '#222'
    });
    return;
  }

  try {
    const response = await fetch('http://localhost:3025/api/auth/cadastro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, email, senha, perfil })
    });

    const user = await response.json();

    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Cadastro realizado!',
        text: 'Redirecionando para o login...',
        showConfirmButton: false,
        timer: 2500,
        color: '#222'
      }).then(() => {
        window.location.href = '/login';
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erro no cadastro',
        text: user.error || 'Ocorreu um erro ao tentar cadastrar.',
        confirmButtonColor: '#bf1b1b',
        color: '#222'
      });
    }

  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Erro de servidor',
      text: 'Erro na comunicação com o servidor',
      confirmButtonColor: '#bf1b1b',
      color: '#222'
    });
    console.error(error);
  }
});
