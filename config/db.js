const mysql = require('mysql2');

const pool = mysql.createPool({
 /* port: 3306,
  user: 'root',
  password: 'linux',
  database: 'habit_tracker' */

  host: '52.207.247.250',
  port: 3306,
  user: 'gabo',
  password: 'pato123',
  database: 'habit_tracker',

  ssl: {
    rejectUnauthorized: false
}

});


module.exports = pool.promise();
