const pool = require('../../database/postgres/pool');
const ReplyRepoPg = require('../ReplyRepositoryPostgres');
const NewReply = require('../../../Domains/replies/entities/NewReply');

const UsersHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesHelper = require('../../../../tests/RepliesTableTestHelper');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
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
    await CommentsHelper.addComment({
      id: 'comment-123',
      thread_id: 'thread-123',
      content: 'isi komen',
      owner: 'user-123',
    });
  });

  afterEach(async () => {
    await RepliesHelper.cleanTable();
    await CommentsHelper.cleanTable();
    await ThreadsHelper.cleanTable();
    await UsersHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply()', () => {
    it('saves and retrieves a reply', async () => {
      const payload = new NewReply({ commentId: 'comment-123', content: 'isi reply', owner: 'user-123' });
      const idStub = () => '123';
      const repo = new ReplyRepoPg(pool, idStub);

      await repo.addReply(payload);

      const rows = await RepliesHelper.findReplyById('reply-123');
      expect(rows).toHaveLength(1);
    });

    it('returns the reply data correctly', async () => {
      const payload = new NewReply({ commentId: 'comment-123', content: 'isi reply', owner: 'user-123' });
      const idStub = () => '123';
      const repo = new ReplyRepoPg(pool, idStub);

      const result = await repo.addReply(payload);
      expect(result).toStrictEqual({ id: 'reply-123', content: 'isi reply', owner: 'user-123' });
    });
  });

  describe('verifyReplyExist()', () => {
    it('throws NotFoundError if no such reply', async () => {
      const repo = new ReplyRepoPg(pool, () => '123');
      await expect(repo.verifyReplyExist('missing')).rejects.toThrow(NotFoundError);
    });

    it('does not throw if reply exists', async () => {
      await RepliesHelper.addReply({ id: 'reply-123', comment_id: 'comment-123', content: 'isi reply', owner: 'user-123' });
      const repo = new ReplyRepoPg(pool, () => '123');

      await expect(repo.verifyReplyExist('reply-123')).resolves.not.toThrow();
    });
  });

  describe('verifyReplyOwner()', () => {
    it('throws AuthorizationError on wrong owner', async () => {
      const repo = new ReplyRepoPg(pool, () => '123');
      await expect(repo.verifyReplyOwner({ replyId: 'x', userId: 'y' })).rejects.toThrow(AuthorizationError);
    });

    it('resolves when the owner is correct', async () => {
      await RepliesHelper.addReply({ id: 'reply-123', comment_id: 'comment-123', content: 'isi reply', owner: 'user-123' });
      const repo = new ReplyRepoPg(pool, () => '123');

      await expect(repo.verifyReplyOwner({ replyId: 'reply-123', userId: 'user-123' })).resolves.not.toThrow();
    });
  });

  describe('deleteReplyById()', () => {
    it('marks a reply as deleted', async () => {
      await RepliesHelper.addReply({ id: 'reply-123', comment_id: 'comment-123', content: 'isi reply', owner: 'user-123' });
      const repo = new ReplyRepoPg(pool, () => '123');

      await repo.deleteReplyById('reply-123');

      const [row] = await RepliesHelper.findReplyById('reply-123');
      expect(row.is_deleted).toBe(true);
    });
  });

  describe('getRepliesByCommentId()', () => {
    it('retrieves replies in chronological order with deletion flag', async () => {
      const date1 = new Date();
      await RepliesHelper.addReply({ id: 'reply-123', comment_id: 'comment-123', content: 'isi reply 1', owner: 'user-123', date: date1 });
      await new Promise(r => setTimeout(r, 50));
      const date2 = new Date();
      await RepliesHelper.addReply({ id: 'reply-1234', comment_id: 'comment-123', content: 'isi reply 2', owner: 'user-123', date: date2 });
      await RepliesHelper.markDeleted('reply-1234');

      const repo = new ReplyRepoPg(pool, () => '123');
      const replies = await repo.getRepliesByCommentId('comment-123');

      expect(replies).toHaveLength(2);
      expect(replies[0]).toMatchObject({ id: 'reply-123', username: 'dicoding', date: date1, content: 'isi reply 1', is_deleted: false });
      expect(replies[1]).toMatchObject({ id: 'reply-1234', username: 'dicoding', date: date2, content: 'isi reply 2', is_deleted: true });
      expect(replies[0].date.getTime()).toBeLessThanOrEqual(replies[1].date.getTime());
    });
  });
});