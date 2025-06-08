const mysql = require('mysql2');

const db = mysql.createConnection ({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_DATABASE
});

const dbPromise = db.promise();

db.connect(err => {
    if (err) throw err;
    console.log('conectado ao banco com sucesso ✅');
});

module.exports = { db, dbPromise };