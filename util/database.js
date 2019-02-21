const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'erp',
    password: 'iamnickhifi3'
});

module.exports = pool.promise();