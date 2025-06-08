const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT;


const { db } = require('./config/database');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const authRoutes = require('./routes/auth');
const livrosRoutes = require('./routes/livros');
const emprestimosRoutes = require('./routes/emprestimos');

app.use('/api/auth', authRoutes);
app.use('/api/livros', livrosRoutes);
app.use('/api/emprestimos', emprestimosRoutes);

app.get('/', (req, res) => {
    res.send('Biblioteca Web - API funcionando');
});

app.listen(port, ()=>{
    console.log(`Servidor ${port} ativo`);
})