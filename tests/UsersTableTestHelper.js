const pool = require('../src/Infrastructures/database/postgres/pool');

const UsersTableTestHelper = {
  addUser: async function ({
    id = 'user-123',
    username = 'dicoding',
    password = 'secret',
    fullname = 'Dicoding Indonesia',
  }) {
    const sql = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4)',
      values: [id, username, password, fullname],
    };
    await pool.query(sql);
  },

  findUsersById: async function (userId) {
    const sql = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [userId],
    };
    const { rows } = await pool.query(sql);
    return rows;
  },

  cleanTable: async function () {
    await pool.query('DELETE FROM users');
  },
};

module.exports = UsersTableTestHelper;
