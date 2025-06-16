const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGen = idGenerator;
  }

  async addComment(newComment) {
    const { threadId, content, owner } = newComment;
    const commentId = `comment-${this._idGen()}`;
    const sql = {
      text: `
        INSERT INTO comments (id, thread_id, content, owner)
        VALUES ($1, $2, $3, $4)
        RETURNING id, content, owner
      `,
      values: [commentId, threadId, content, owner],
    };
    const { rows } = await this._pool.query(sql);
    return rows[0];
  }

  async verifyCommentExist(commentId) {
    const sql = {
      text: 'SELECT 1 FROM comments WHERE id = $1',
      values: [commentId],
    };
    const result = await this._pool.query(sql);
    if (!result.rowCount) {
      throw new NotFoundError('Comment tidak ditemukan');
    }
  }

  async verifyCommentOwner({ commentId, userId }) {
    const sql = {
      text: 'SELECT 1 FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, userId],
    };
    const result = await this._pool.query(sql);
    if (!result.rowCount) {
      throw new AuthorizationError('Anda tidak berhak menghapus comment ini');
    }
  }

  async deleteCommentById(commentId) {
    const sql = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1',
      values: [commentId],
    };
    await this._pool.query(sql);
  }

  async getCommentsByThreadId(threadId) {
    const sql = {
      text: `
        SELECT c.id, u.username, c.date, c.content, c.is_deleted
        FROM comments c
        JOIN users u ON c.owner = u.id
        WHERE c.thread_id = $1
        ORDER BY c.date ASC
      `,
      values: [threadId],
    };
    const { rows } = await this._pool.query(sql);
    return rows;
  }
}

module.exports = CommentRepositoryPostgres;
