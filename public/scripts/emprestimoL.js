function sair() {
  window.location.href = "/login";
}

function voltar() {
  window.location.href = "/leitor";
}

window.addEventListener('DOMContentLoaded', async () => {
  const tabela = document.querySelector('#tabela-livros tbody');

  try {
    const api = await fetch('http://localhost:3025/api/emprestimos/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const emprestimos = await api.json();

    emprestimos.forEach(emp => {
      const tr = document.createElement('tr');
      const dataFormatada = emp.data_devolucao_prevista
        ? new Date(emp.data_devolucao_prevista).toLocaleDateString('pt-BR')
        : '-';

      let botaoHTML = '';

      if (emp.status === 'ativo' || emp.status === 'atrasado') {
        if (emp.devolucao_solicitada) {
          botaoHTML = `<button class="solicitado" disabled>Solicitado!</button>`;
        } else {
          botaoHTML = `<button class="solicitar2" onclick="solicitarDevolucao(this, ${emp.id})">Solicitar devolução</button>`;
        }
      } else {
        botaoHTML = `<button class="devolvido" disabled>Devolvido ✅</button>`;
      }

      tr.innerHTML = `
        <td>${emp.livro_id}</td>
        <td>${emp.titulo}</td>
        <td>${emp.autor}</td>
        <td>${emp.ano_publicacao || '-'}</td>
        <td>${dataFormatada}</td>
        <td>${emp.status}</td>
        <td>${botaoHTML}</td>
    `;
      tabela.appendChild(tr);
    });


  } catch (erro) {
    console.error(erro);
    Swal.fire('Erro!', 'Não foi possível carregar seus empréstimos.', 'error');
  }
});

function solicitarDevolucao(botao, emprestimoId) {

  fetch('http://localhost:3025/api/emprestimos/solicitar-devolucao', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ emprestimo_id: emprestimoId })
  })
    .then(data => {
      Swal.fire({
            icon: 'success',
            title: 'Solicitação enviada!',
            text: 'Aguarde aprovação do bibliotecário.',
            confirmButtonColor: '#006600',
            color: '#222'
        }).then(() => {
            window.location.reload();
        });
    })
    .catch(err => {
      console.error(err);
      Swal.fire('Erro!', 'Não foi possível solicitar a devolução.', 'error');
    });
}
