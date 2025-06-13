const express = require('express');
const bcrypt = require('bcrypt');
const { dbPromise } = require('../config/database');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha, perfil } = req.body;

    if (!nome || !email || !senha || !perfil) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const [existeUser] = await dbPromise.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existeUser.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    await dbPromise.query(
      'INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)',
      [nome, email, hashedPassword, perfil]
    );

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const [user] = await dbPromise.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (user.length === 0) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const usuario = user[0];

    const passwordMatch = await bcrypt.compare(senha, usuario.senha);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const token = jwt.sign({ id: usuario.id, perfil: usuario.perfil }, process.env.JWT_SECRET, {
      expiresIn: '3d',
    });

    return res.json({
      token,
      nome: usuario.nome,
      perfil: usuario.perfil
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;