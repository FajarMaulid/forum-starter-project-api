const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  addComment: async function ({
    id = 'comment-123',
    threadId = 'thread-123',
    content = 'isi komen',
    owner = 'user-123',
    date = new Date(),
    isDeleted = false,
  } = {}) {
    const sql = {
      text: 'INSERT INTO comments (id, thread_id, content, owner, date, is_deleted) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, threadId, content, owner, date, isDeleted],
    };
    await pool.query(sql);
  },

  findCommentById: async function (id) {
    const sql = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };
    const { rows } = await pool.query(sql);
    return rows;
  },

  markDeleted: async function (id) {
    const sql = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1',
      values: [id],
    };
    await pool.query(sql);
  },

  cleanTable: async function () {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
