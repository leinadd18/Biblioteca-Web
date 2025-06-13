function sair() {
    window.location.href = "/login";
}

function Emprestimos(){
  window.location.href = "/Emprestimos";
}

const mascara = document.querySelector(".mascara-formulario");

function mostrarFormulario(id) {
    const form = document.getElementById(id);
    mascara.style.visibility = "visible";
    form.style.left = "50%";
    form.style.transform = "translateX(-50%)";
}

function esconderFormulario(...ids) {
    ids.forEach(id => {
        const form = document.getElementById(id);
        if (form) {
            form.style.left = "-400px";
            form.style.transform = "translateX(0)";
        }
    });

    setTimeout(() => {
        mascara.style.visibility = "hidden";
    }, 300);
}



window.addEventListener('DOMContentLoaded', async () => {
    const nome = localStorage.getItem('nome');
    const perfil = localStorage.getItem('perfil');
    const boasVindas = document.getElementById('boas-vindas');
    const tabela = document.querySelector('#tabela-livros tbody');

    if (nome && perfil) {
        boasVindas.textContent = `Boas-vindas bibliotecário(a) ${nome} ✍🏽`;
    } else {
        boasVindas.textContent = 'Bem-vindo(a)!';
    }

    try {
        const TodosLivros = await fetch('http://localhost:3025/api/livros/disponiveis', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        const livros = await TodosLivros.json();

        livros.forEach(livro => {
            let cor = '';
            if (livro.quantidade_disponivel < 4) cor = 'vermelho';
            else if (livro.quantidade_disponivel < 6) cor = 'amarelo';
            else cor = 'verde';

            const tr = document.createElement('tr');
            tr.innerHTML = `
        <th>${livro.id}</th>
        <td>${livro.titulo}</td>
        <td>${livro.autor}</td>
        <td>${livro.ano_publicacao || '-'}</td>
        <td class="${cor}">${livro.quantidade_disponivel || '-'}</td>
        <td>
        <div class="conteiner-botoes">
         <button
        title="Editar"
        class="botoes"
        onclick="abrirEditar(${livro.id}, '${livro.titulo}', '${livro.autor}', ${livro.ano_publicacao || 'null'}, ${livro.quantidade_disponivel || 0})"
      >✏️</button>
          <button title="Excluir" class="botoes" onclick="deletarLivro(${livro.id})">🗑️</button>
          </div>
        </td>
      `;
            tabela.appendChild(tr);
        });

    } catch (error) {
        console.error(error);
        alert('Erro ao buscar livros');
    }
});

document.getElementById('formularioNovo').addEventListener('submit', async function (event) {
    event.preventDefault();

    const titulo = document.getElementById('titulo').value;
    const autor = document.getElementById('autor').value;
    const ano_publicacao = document.getElementById('ano').value;
    const quantidade_disponivel = document.getElementById('quantidade').value;

    try {
        const api = await fetch('http://localhost:3025/api/livros/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                titulo,
                autor,
                ano_publicacao: ano_publicacao || null,
                quantidade_disponivel
            })
        });

        if (api.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Livro cadastrado com sucesso!',
                confirmButtonColor: '#006600',
                color: '#222',
            }).then(() => {
                document.getElementById('formularioNovo').reset();
                window.location.reload();
            });

        } else {
            const result = await api.json();
            Swal.fire({
                icon: 'error',
                title: 'Erro ao cadastrar',
                text: result.error || 'Erro desconhecido.',
                confirmButtonColor: '#a70000',
            });
        }

    } catch (error) {
        console.error('Erro ao cadastrar livro:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro de conexão',
            text: 'Não foi possível conectar ao servidor.',
            confirmButtonColor: '#a70000',
        });
    }
});

const formEditar = document.getElementById('formularioEditar');

function abrirEditar(id, titulo, autor, ano, quantidade) {
    formEditar.dataset.id = id; 

    formEditar.querySelector('#titulo').value = titulo;
    formEditar.querySelector('#autor').value = autor;
    formEditar.querySelector('#ano').value = ano || '';
    formEditar.querySelector('#quantidade').value = quantidade || '';

    mostrarFormulario('formularioEditar');
}

formEditar.addEventListener('submit', async function (e) {
    e.preventDefault();

    const idLivro = this.dataset.id;
    const titulo = this.querySelector('#titulo').value.trim();
    const autor = this.querySelector('#autor').value.trim();
    const ano_publicacao = this.querySelector('#ano').value.trim();
    const quantidade_disponivel = this.querySelector('#quantidade').value.trim();

    try {
        const resposta = await fetch(`http://localhost:3025/api/livros/${idLivro}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                titulo,
                autor,
                ano_publicacao: ano_publicacao ? Number(ano_publicacao) : null,
                quantidade_disponivel: quantidade_disponivel ? Number(quantidade_disponivel) : null
            })
        });

        const result = await resposta.json();

        if (resposta.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Livro atualizado com sucesso!',
                confirmButtonColor: '#006600',
                color: '#222'
            }).then(() => {
                window.location.reload();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: result.error,
                confirmButtonColor: '#a70000',
            });
        }
    } catch (error) {
        Swal.fire(
            'Erro', 
            'Erro ao atualizar livro', 
            'error');
    }
});


async function deletarLivro(id) {
    const confirmacao = await Swal.fire({
        title: 'Tem certeza?',
        text: 'Você deseja mesmo deletar este livro?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#a70000',
        cancelButtonColor: '#707070',
        confirmButtonText: 'Sim, deletar',
        cancelButtonText: 'Cancelar',
        color: '#222',
    });

    if (confirmacao.isConfirmed) {
        try {
            const resposta = await fetch(`http://localhost:3025/api/livros/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            const result = await resposta.json();

            if (resposta.ok) {
                Swal.fire({
                    icon: 'success',
                    title: result.message,
                    confirmButtonColor: '#006600',
                    color: '#222'
                }).then(() => {
                    window.location.reload();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: result.error,
                    confirmButtonColor: '#a70000',
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erro de conexão',
                text: 'Não foi possível conectar ao servidor.',
                confirmButtonColor: '#a70000',
            });
        }
    }
}
