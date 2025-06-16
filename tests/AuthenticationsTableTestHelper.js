const pool = require('../src/Infrastructures/database/postgres/pool');

const AuthenticationsTableTestHelper = {
  addToken: async function (token) {
    const sqlQuery = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };
    await pool.query(sqlQuery);
  },

  findToken: async function (token) {
    const sqlQuery = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };
    const { rows } = await pool.query(sqlQuery);
    return rows;
  },

  cleanTable: async function () {
    await pool.query('DELETE FROM authentications WHERE 1=1');
  },
};

module.exports = AuthenticationsTableTestHelper;
