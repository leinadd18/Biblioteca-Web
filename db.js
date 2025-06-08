const mysql = require('mysql2');

const db = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: 'admin123', //sua_senha_mysql
    database: 'biblioteca_sistema'
});

db.connect(err => {
    if (err) throw err;
    console.log('conectado ao banco com sucesso ✅');
});

module.exports = db;