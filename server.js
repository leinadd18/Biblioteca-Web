const express = require('express');
const app = express();
const port = 3025;


const db = require('./db');

app.listen(port, ()=>{
    console.log(`Servidor ativo`);
})