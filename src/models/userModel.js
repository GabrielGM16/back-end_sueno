const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'linux',
  database: 'habit_tracker'
});

module.exports = pool.promise();
