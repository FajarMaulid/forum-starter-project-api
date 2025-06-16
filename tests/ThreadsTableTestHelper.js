const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadsTableTestHelper = {
  addThread: async function ({
    id = 'thread-123',
    title = 'judul',
    body = 'isi',
    owner = 'user-123',
    date = new Date(),
  } = {}) {
    const sql = {
      text: 'INSERT INTO threads (id, title, body, owner, date) VALUES($1, $2, $3, $4, $5)',
      values: [id, title, body, owner, date],
    };
    await pool.query(sql);
  },

  findThreadById: async function (threadId) {
    const sql = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [threadId],
    };
    const { rows } = await pool.query(sql);
    return rows;
  },

  cleanTable: async function () {
    await pool.query('DELETE FROM threads');
  },
};

module.exports = ThreadsTableTestHelper;
