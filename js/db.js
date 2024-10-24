const pgp = require('pg-promise')();
const db = pgp(
    {
        host: 'localhost',
        port: 5432,
        database: 'gestao_tarefas',
        user: 'postgres',
        password: '12345'
    }
);

module.exports = db;