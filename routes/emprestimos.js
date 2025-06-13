const express = require('express');
const { dbPromise } = require('../config/database');
const { authenticateToken, Bibliotecario, Leitor } = require('../middleware/auth');
const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    let emprestimos;

    if (req.user.perfil === 'bibliotecario') {

      const [rows] = await dbPromise.query(`
        SELECT e.*, l.titulo, l.autor, u.nome as leitor_nome 
        FROM emprestimos e
        JOIN livros l ON e.livro_id = l.id
        JOIN usuarios u ON e.leitor_id = u.id
        ORDER BY e.created_at DESC
      `);
      emprestimos = rows;
    } else {
  
      const [rows] = await dbPromise.query(`
        SELECT e.*, l.titulo, l.autor, l.ano_publicacao 
        FROM emprestimos e
        JOIN livros l ON e.livro_id = l.id
        WHERE e.leitor_id = ?
        ORDER BY e.created_at DESC
      `, [req.user.id]);
      emprestimos = rows;
    }

    res.json(emprestimos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar empréstimos'});
  }
});

router.post('/solicitar', Leitor, async (req, res) => {
  try {
    const { livro_id } = req.body;
    const leitor_id = req.user.id;

    if (!livro_id) {
      return res.status(400).json({ error: 'ID do livro é obrigatório' });
    }

    const [livros] = await dbPromise.query('SELECT * FROM livros WHERE id = ?', [livro_id]);
    if (livros.length === 0) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }

    const livro = livros[0];
    if (livro.quantidade_disponivel <= 0) {
      return res.status(400).json({ error: 'Livro não disponível para empréstimo' });
    }

    const data_emprestimo = new Date().toISOString().split('T')[0];
    const data_devolucao_prevista = new Date();
    data_devolucao_prevista.setDate(data_devolucao_prevista.getDate() + 14);

    await dbPromise.query(
      'INSERT INTO emprestimos (livro_id, leitor_id, data_emprestimo, data_devolucao_prevista, status) VALUES (?, ?, ?, ?, "ativo")',
      [livro_id, leitor_id, data_emprestimo, data_devolucao_prevista.toISOString().split('T')[0]]
    );

    await dbPromise.query(
      'UPDATE livros SET quantidade_disponivel = quantidade_disponivel - 1 WHERE id = ?',
      [livro_id]
    );

    res.status(201).json({ message: 'Empréstimo solicitado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao solicitar empréstimo'});
  }
});

router.post('/solicitar-devolucao', Leitor, async (req, res) => {
  try {
    const { emprestimo_id } = req.body;
    const leitor_id = req.user.id;

    if (!emprestimo_id) {
      return res.status(400).json({ error: 'ID do empréstimo é obrigatório' });
    }

    const [emprestimos] = await dbPromise.query(
      'SELECT * FROM emprestimos WHERE id = ? AND leitor_id = ?',
      [emprestimo_id, leitor_id]
    );

    if (emprestimos.length === 0) {
      return res.status(404).json({ error: 'Empréstimo não encontrado ou não pertence ao leitor' });
    }

    const emprestimo = emprestimos[0];

    if (emprestimo.status === 'devolvido') {
      return res.status(400).json({ error: 'Este livro já foi devolvido' });
    }

    if (emprestimo.devolucao_solicitada) {
      return res.status(400).json({ error: 'A devolução já foi solicitada' });
    }

    await dbPromise.query(
      'UPDATE emprestimos SET devolucao_solicitada = 1 WHERE id = ?',
      [emprestimo_id]
    );

    res.json({ message: 'Solicitação de devolução enviada com sucesso' });

  } catch (error) {
    res.status(500).json({ error: 'Erro ao solicitar devolução'});
  }
});


router.put('/:id/devolver', Bibliotecario, async (req, res) => {
  try {
    const { id } = req.params;

    const [emprestimos] = await dbPromise.query('SELECT * FROM emprestimos WHERE id = ?', [id]);
    if (emprestimos.length === 0) {
      return res.status(404).json({ error: 'Empréstimo não encontrado' });
    }

    const emprestimo = emprestimos[0];
    if (emprestimo.status === 'devolvido') {
      return res.status(400).json({ error: 'Empréstimo já foi devolvido' });
    }

    const data_emprestimo = new Date().toISOString().split('T')[0];

    await dbPromise.query(
      'UPDATE emprestimos SET status = "devolvido", data_emprestimo = ? WHERE id = ?',
      [data_emprestimo, id]
    );

    await dbPromise.query(
      'UPDATE livros SET quantidade_disponivel = quantidade_disponivel + 1 WHERE id = ?',
      [emprestimo.livro_id]
    );

  } catch (error) {
    res.status(500).json({ error: 'Erro ao aprovar devolução' });
  }
});

module.exports = router;
