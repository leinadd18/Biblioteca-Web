const express = require('express');
const { dbPromise } = require('../config/database');
const { authenticateToken, Bibliotecario } = require('../middleware/auth');
const router = express.Router();


router.use(authenticateToken);

router.get('/disponiveis', authenticateToken, async (req, res) => {
  try {
    const { perfil } = req.user;

    let query = 'SELECT * FROM livros';
    const params = [];

    if (perfil === 'leitor') {
      query += ' WHERE quantidade_disponivel > 0';
    }

    query += ' ORDER BY id ASC';

    const [livros] = await dbPromise.query(query, params);
    res.json(livros);

  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar livros disponíveis' });
  }
});

router.post('/cadastro', Bibliotecario, async (req, res) => {
  try {
    const { titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;

    if (!titulo || !autor || quantidade_disponivel === undefined) {
      return res.status(400).json({ error: 'Título, autor e quantidade são obrigatórios' });
    }

    await dbPromise.query(
      'INSERT INTO livros (titulo, autor, ano_publicacao, quantidade_disponivel) VALUES (?, ?, ?, ?)',
      [titulo, autor, ano_publicacao || null, quantidade_disponivel]
    );

    res.status(201).json({ message: 'Livro adicionado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar livro' });
  }
});

router.put('/:id', Bibliotecario, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;

    const [livros] = await dbPromise.query('SELECT * FROM livros WHERE id = ?', [id]);
    if (livros.length === 0) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }

    const livroAtual = livros[0];

    // Define novos valores: se enviado e não vazio, usa o novo, senão mantém o atual
    const novoTitulo = (titulo && titulo.trim() !== '') ? titulo : livroAtual.titulo;
    const novoAutor = (autor && autor.trim() !== '') ? autor : livroAtual.autor;
    const novoAno = (ano_publicacao && ano_publicacao !== '') ? ano_publicacao : livroAtual.ano_publicacao;
    const novaQuantidade = (quantidade_disponivel !== undefined && quantidade_disponivel !== null && quantidade_disponivel !== '')
      ? Number(quantidade_disponivel)
      : livroAtual.quantidade_disponivel;


    await dbPromise.query(
      'UPDATE livros SET titulo = ?, autor = ?, ano_publicacao = ?, quantidade_disponivel = ? WHERE id = ?',
      [novoTitulo, novoAutor, novoAno, novaQuantidade, id]
    );

    res.json({ message: 'Livro atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar livro' });
  }
});


router.delete('/:id', Bibliotecario, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await dbPromise.query('DELETE FROM livros WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }

    res.json({ message: 'Livro removido com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover livro' });
  }
});

module.exports = router;
