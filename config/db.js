const mysql = require('mysql2');

const pool = mysql.createPool({
    port: 3306,
  user: 'root',
  password: 'linux',
  database: 'habit_tracker'
});

module.exports = pool.promise();
