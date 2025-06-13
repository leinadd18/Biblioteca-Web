const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT;
const path = require('path');


const { db } = require('./config/database');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//Rotas BackEnd
const authRoutes = require('./routes/auth');
const livrosRoutes = require('./routes/livros');
const emprestimosRoutes = require('./routes/emprestimos');

app.use('/api/auth', authRoutes);
app.use('/api/livros', livrosRoutes);
app.use('/api/emprestimos', emprestimosRoutes);


//Rotas FrontEnd
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
});

app.get('/cadastrar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'Cadastro.html'));
});

app.get('/leitor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'HomeL.html'));
});

app.get('/MeusEmprestimos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'emprestimoL.html'));
});

app.get('/Emprestimos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'emprestimoB.html'));
});

app.get('/bibliotecario', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'HomeB.html'));
});


app.listen(port, ()=>{
    console.log(`Servidor ${port} ativo`);
})