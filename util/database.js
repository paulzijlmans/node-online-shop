const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'database',
  user: 'root',
  database: 'node-online-shop',
  password: 'password'
});

module.exports = pool.promise();