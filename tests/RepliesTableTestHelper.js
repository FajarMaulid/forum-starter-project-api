const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  addReply: async function ({
    id = 'reply-123',
    commentId = 'comment-123',
    content = 'isi reply',
    owner = 'user-123',
    date = new Date(),
    isDeleted = false,
  } = {}) {
    const sql = {
      text: 'INSERT INTO replies (id, content, comment_id, owner, date, is_deleted) VALUES ($1, $2, $3, $4, $5, $6)',
      values: [id, content, commentId, owner, date, isDeleted],
    };
    await pool.query(sql);
  },

  findReplyById: async function (id) {
    const sql = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };
    const { rows } = await pool.query(sql);
    return rows;
  },

  markDeleted: async function (id) {
    const sql = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [id],
    };
    await pool.query(sql);
  },

  cleanTable: async function () {
    await pool.query('DELETE FROM replies');
  },
};

module.exports = RepliesTableTestHelper;
