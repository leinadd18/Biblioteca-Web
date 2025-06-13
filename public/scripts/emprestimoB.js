function sair() {
  window.location.href = "/login";
}

function voltar() {
  window.location.href = "/bibliotecario";
}

async function carregarEmprestimos() {
  try {
    const res = await fetch('http://localhost:3025/api/emprestimos', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    console.log('Status da resposta:', res.status);

    if (!res.ok) {
      const texto = await res.text();
      console.error('Erro na resposta:', texto);
      alert("Erro ao carregar seus empréstimos.");
      return;
    }

    const emprestimos = await res.json();

    const tbody = document.querySelector('#tabela-emprestimos tbody');
    tbody.innerHTML = '';

    emprestimos.forEach(emp => {
      const tr = document.createElement('tr');

      let solicitado = '🔴 Pendente';

      if (emp.status === 'devolvido' || emp.devolucao_solicitada === 1) {
        solicitado = '🟢 Solicitado';
      }

      const dataFormatada = emp.data_emprestimo
        ? new Date(emp.data_emprestimo).toLocaleDateString('pt-BR')
        : '-';
      const dataFormPrevista = emp.data_devolucao_prevista
        ? new Date(emp.data_devolucao_prevista).toLocaleDateString('pt-BR')
        : '-';

      tr.innerHTML = `
        <td>${emp.titulo}</td>
        <td>${emp.leitor_nome || '-'}</td>
        <td>${dataFormatada}</td>
        <td>${dataFormPrevista}</td>
        <td>${emp.status}</td>
        <td>${solicitado}</td>
        <td>
            ${emp.status === 'ativo' || emp.status === 'atrasado' ?
          `<button class="marcar" onclick="devolverLivro(${emp.id})">Marcar como devolvido</button>` :
          ''}
        </td>
    `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    alert("Erro ao carregar seus empréstimos.");
  }
}

carregarEmprestimos();

async function devolverLivro(id) {
  const confirmacao = await Swal.fire({
    title: 'Tem certeza que deseja marcar como devolvido?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#1c7900',
    cancelButtonColor: '#a70000',
    confirmButtonText: 'Sim, marcar como devolvido',
    cancelButtonText: 'Cancelar',
    color: '#222',
  });
  if (confirmacao.isConfirmed) {
    try {
      const res = await fetch(`http://localhost:3025/api/emprestimos/${id}/devolver`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Devolução aprovada com sucesso!',
          showConfirmButton: false,
          color: '#222',
          timer: 1500
        }).then(() => {
          carregarEmprestimos();
        });

      }
    } catch (error) {
      alert('Erro ao marcar devolvido.');
    }
  }
}


