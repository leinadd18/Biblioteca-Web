document.getElementById('submit').addEventListener('click', async (e) => {
    e.preventDefault();

    const email = document.querySelector('input[type="email"]').value;
    const senha = document.querySelector('input[type="password"]').value;

    try {
        const api = await fetch('http://localhost:3025/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const user = await api.json();

        if (api.ok) {
            localStorage.setItem('token', user.token);
            localStorage.setItem('perfil', user.perfil);
            localStorage.setItem('nome', user.nome);

            Swal.fire({
                icon: 'success',
                title: 'Login realizado com sucesso!',
                showConfirmButton: false,
                color: '#222',
                timer: 1500

            }).then(() => {
                if (user.perfil === 'bibliotecario') {
                    window.location.href = '/bibliotecario';
                } else {
                    window.location.href = '/leitor';
                }
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Erro no login',
                text: user.error || 'Verifique seus dados e tente novamente.',
                confirmButtonColor: '#bf1b1b',
                color: '#222'
            });
        }

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Erro de conexão',
            text: 'Não foi possível conectar ao servidor.',
            confirmButtonColor: '#bf1b1b',
            color: '#222'
        });
        console.error(error);
    }
});
