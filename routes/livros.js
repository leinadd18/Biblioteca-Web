const express = require('express');
const { dbPromise } = require('../config/database');
const { authenticateToken, Bibliotecario } = require('../middleware/auth');
const router = express.Router();


router.use(authenticateToken);

// GET
router.get('/listas', async (req, res) => {
  try {
    const [livros] = await dbPromise.query('SELECT * FROM livros ORDER BY titulo');
    res.json(livros);
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET 
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [livros] = await dbPromise.query('SELECT * FROM livros WHERE id = ?', [id]);

    if (livros.length === 0) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }

    res.json(livros[0]);
  } catch (error) {
    console.error('Erro ao buscar livro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST 
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
    console.error('Erro ao adicionar livro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT
router.put('/:id', Bibliotecario, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;

    if (!titulo || !autor || quantidade_disponivel === undefined) {
      return res.status(400).json({ error: 'Título, autor e quantidade são obrigatórios' });
    }

    const [result] = await dbPromise.query(
      'UPDATE livros SET titulo = ?, autor = ?, ano_publicacao = ?, quantidade_disponivel = ? WHERE id = ?',
      [titulo, autor, ano_publicacao || null, quantidade_disponivel, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }

    res.json({ message: 'Livro atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar livro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE 
router.delete('/:id', Bibliotecario, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await dbPromise.query('DELETE FROM livros WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }

    res.json({ message: 'Livro removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao remover livro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
