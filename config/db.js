const mysql = require('mysql2');

const pool = mysql.createPool({
  host: '54.210.84.99',
  port: 3306,
  user: 'gabo',
  password: 'pato123',
  database: 'habit_tracker'
});

module.exports = pool.promise();
