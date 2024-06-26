const mysql = require('mysql2');

const pool = mysql.createPool({
  /* port: 3306,
  user: 'root',
  password: 'linux',
  database: 'habit_tracker' */

   host: '54.210.84.99',
  port: 3306,
  user: 'gabo',
  password: 'pato123',
  database: 'habit_tracker' 

});


module.exports = pool.promise();
