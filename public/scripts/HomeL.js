function sair() {
    window.location.href = "/login";
}

function Meus() {
    window.location.href = "/MeusEmprestimos";
}

window.addEventListener('DOMContentLoaded', async () => {
    const nome = localStorage.getItem('nome');
    const perfil = localStorage.getItem('perfil');
    const boasVindas = document.getElementById('boas-vindas');
    const tabela = document.querySelector('#tabela-livros tbody');

    if (nome && perfil) {
        boasVindas.textContent = `Boas-vindas leitor(a) ${nome}! 🤓`;
    } else {
        boasVindas.textContent = 'Bem-vindo(a)!';
    }

    try {

        const Livros = await fetch('http://localhost:3025/api/livros/disponiveis', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        const TodosLivros = await Livros.json();

        const Emprestimos = await fetch('http://localhost:3025/api/emprestimos/', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        const TodosEmprestimos = await Emprestimos.json();

        const livrosSolicitados = TodosEmprestimos
            .filter(e => e.status === 'ativo' || e.status === 'atrasado')
            .map(e => e.livro_id);

        TodosLivros.forEach(livro => {
            let cor = '';
            if (livro.quantidade_disponivel < 4) cor = 'vermelho';
            else if (livro.quantidade_disponivel < 6) cor = 'amarelo';
            else cor = 'verde';

            const tr = document.createElement('tr');

            const jaSolicitado = livrosSolicitados.includes(livro.id);

            const botao = jaSolicitado
                ? `<button class="solicitado" disabled>Solicitado!</button>`
                : `<button class="solicitar" onclick="solicitarEmprestimo(this, ${livro.id})">Solicitar Empréstimos💡</button>`;

            tr.innerHTML = `
                <th>${livro.id}</th>
                <td>${livro.titulo}</td>
                <td>${livro.autor}</td>
                <td>${livro.ano_publicacao || '-'}</td>
                <td class="${cor}">${livro.quantidade_disponivel || '-'}</td>
                <td>
                    <div class="conteiner-botoes">
                        ${botao}
                    </div>
                </td>
            `;

            tabela.appendChild(tr);
        });

    } catch (error) {
        console.error(error);
        alert('Erro ao buscar livros ou empréstimos');
    }
});

async function solicitarEmprestimo(botao, livroId) {
    try {
        const resposta = await fetch('http://localhost:3025/api/emprestimos/solicitar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ livro_id: livroId }),
        });

        if (resposta.ok) {
            await Swal.fire({
                icon: 'success',
                title: 'Empréstimo solicitado com sucesso!',
                confirmButtonColor: '#006600',
                color: '#222'
            });
            window.location.reload();
        }

    } catch (erro) {
        Swal.fire({
            icon: 'error',
            title: 'Não foi possível solicitar o empréstimo.',
            confirmButtonColor: '#a70000',
        });
    }
}
