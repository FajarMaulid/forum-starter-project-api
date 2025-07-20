const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(db, generateId) {
    super();
    this._db = db;
    this._generateId = generateId;
  }

  async checkIfUserHasLikedComment({ commentId, userId }) {
    const sql = {
      text: 'SELECT 1 FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, userId],
    };
    const { rowCount } = await this._db.query(sql);
    return rowCount > 0;
  }

  async likeComment({ commentId, userId }) {
    const likeId = `like-${this._generateId()}`;
    const sql = {
      text: 'INSERT INTO likes (id, comment_id, owner) VALUES ($1, $2, $3)',
      values: [likeId, commentId, userId],
    };
    await this._db.query(sql);
  }

  async unlikeComment({ commentId, userId }) {
    const sql = {
      text: 'DELETE FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, userId],
    };
    await this._db.query(sql);
  }

  async countCommentLikes(commentId) {
    const sql = {
      text: 'SELECT COUNT(*) AS count FROM likes WHERE comment_id = $1',
      values: [commentId],
    };
    const result = await this._db.query(sql);
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = LikeRepositoryPostgres;
