const pool = require('../../database/postgres/pool');
const CommentRepoPg = require('../CommentRepositoryPostgres');
const NewComment = require('../../../Domains/comments/entities/NewComment');

const UsersHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsHelper = require('../../../../tests/CommentsTableTestHelper');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersHelper.addUser({
      id: 'user-123',
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    });
    await ThreadsHelper.addThread({
      id: 'thread-123',
      title: 'judul',
      body: 'isi',
      owner: 'user-123',
    });
  });

  afterEach(async () => {
    await CommentsHelper.cleanTable();
    await ThreadsHelper.cleanTable();
    await UsersHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment()', () => {
    it('should save and retrieve a new comment', async () => {
      const payload = new NewComment({
        threadId: 'thread-123',
        content: 'isi komen',
        owner: 'user-123',
      });
      const idStub = () => '123';
      const repo = new CommentRepoPg(pool, idStub);

      await repo.addComment(payload);

      const rows = await CommentsHelper.findCommentById('comment-123');
      expect(rows).toHaveLength(1);
    });

    it('should return the correct added comment object', async () => {
      const input = { threadId: 'thread-123', content: 'isi komen', owner: 'user-123' };
      const idStub = () => '123';
      const repo = new CommentRepoPg(pool, idStub);

      const result = await repo.addComment(input);
      expect(result).toStrictEqual({ id: 'comment-123', content: 'isi komen', owner: 'user-123' });
    });
  });

  describe('verifyCommentExist()', () => {
    it('throws NotFoundError if comment absent', async () => {
      const repo = new CommentRepoPg(pool, () => '123');
      await expect(repo.verifyCommentExist('nonexistent')).rejects.toThrowError(NotFoundError);
    });

    it('resolves when comment is present', async () => {
      await CommentsHelper.addComment({ id: 'comment-123', thread_id: 'thread-123', content: 'isi komen', owner: 'user-123' });
      const repo = new CommentRepoPg(pool, () => '123');
      await expect(repo.verifyCommentExist('comment-123')).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyCommentOwner()', () => {
    it('throws AuthorizationError on owner mismatch', async () => {
      const repo = new CommentRepoPg(pool, () => '123');
      await expect(repo.verifyCommentOwner({ commentId: 'c', userId: 'u' }))
        .rejects.toThrowError(AuthorizationError);
    });

    it('resolves when user is comment owner', async () => {
      await CommentsHelper.addComment({ id: 'comment-123', thread_id: 'thread-123', content: 'isi komen', owner: 'user-123' });
      const repo = new CommentRepoPg(pool, () => '123');
      await expect(repo.verifyCommentOwner({ commentId: 'comment-123', userId: 'user-123' }))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('deleteCommentById()', () => {
    it('marks comment as deleted', async () => {
      await CommentsHelper.addComment({ id: 'comment-123', thread_id: 'thread-123', content: 'isi komen', owner: 'user-123' });
      const repo = new CommentRepoPg(pool, () => '123');

      await repo.deleteCommentById('comment-123');

      const [row] = await CommentsHelper.findCommentById('comment-123');
      expect(row.is_deleted).toBe(true);
    });
  });

  describe('getCommentsByThreadId()', () => {
    it('retrieves comments in chronological order with deletion status', async () => {
      const date1 = new Date();
      await CommentsHelper.addComment({ id: 'comment-123', thread_id: 'thread-123', content: 'isi komen 1', owner: 'user-123', date: date1 });
      await new Promise(r => setTimeout(r, 50));
      const date2 = new Date();
      await CommentsHelper.addComment({ id: 'comment-1234', thread_id: 'thread-123', content: 'isi komen 2', owner: 'user-123', date: date2 });
      await CommentsHelper.markDeleted('comment-1234');

      const repo = new CommentRepoPg(pool, () => '123');
      const comments = await repo.getCommentsByThreadId('thread-123');

      expect(comments).toHaveLength(2);
      expect(comments[0]).toMatchObject({ id: 'comment-123', username: 'dicoding', date: date1, content: 'isi komen 1', is_deleted: false });
      expect(comments[1]).toMatchObject({ id: 'comment-1234', username: 'dicoding', date: date2, content: 'isi komen 2', is_deleted: true });
      expect(comments[0].date.getTime()).toBeLessThanOrEqual(comments[1].date.getTime());
    });
  });
});