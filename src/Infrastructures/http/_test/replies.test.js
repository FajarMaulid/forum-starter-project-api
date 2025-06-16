const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

const EndpointTestHelper = require('../../../../tests/EndpointTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('Integration /threads/{threadId}/comments/{commentId}/replies', () => {
  let authToken;
  let currentUser;
  const threadId = 'thread-123';
  const commentId = 'comment-123';

  beforeEach(async () => {
    const { accessToken, userId } = await EndpointTestHelper.getAccessTokenAndUserIdHelper();
    authToken = accessToken;
    currentUser = userId;

    await ThreadsTableTestHelper.addThread({ id: threadId, title: 'judul', body: 'isi', owner: currentUser });
    await CommentsTableTestHelper.addComment({ id: commentId, thread_id: threadId, content: 'isi komen', owner: currentUser });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await EndpointTestHelper.cleanTables();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('returns 201 and the created reply', async () => {
      const payload = { content: 'Isi reply' };
      const server = await createServer(container);

      const res = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const result = JSON.parse(res.payload);
      expect(res.statusCode).toBe(201);
      expect(result.status).toBe('success');
      expect(result.data.addedReply).toBeDefined();
      expect(result.data.addedReply).toHaveProperty('id');
      expect(result.data.addedReply).toHaveProperty('content', payload.content);
      expect(result.data.addedReply).toHaveProperty('owner', currentUser);
    });

    it('returns 400 when content is missing', async () => {
      const payload = {};
      const server = await createServer(container);

      const res = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const result = JSON.parse(res.payload);
      expect(res.statusCode).toBe(400);
      expect(result.status).toBe('fail');
      expect(result.message).toBe('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada');
    });

    it('returns 400 when content type is invalid', async () => {
      const payload = { content: true };
      const server = await createServer(container);

      const res = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const result = JSON.parse(res.payload);
      expect(res.statusCode).toBe(400);
      expect(result.status).toBe('fail');
      expect(result.message).toBe('tidak dapat membuat reply baru karena tipe data tidak sesuai');
    });

    it('returns 401 when Authorization header is missing', async () => {
      const payload = { content: 'Isi reply' };
      const server = await createServer(container);

      const res = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload,
      });

      const result = JSON.parse(res.payload);
      expect(res.statusCode).toBe(401);
      expect(result.message).toBe('Missing authentication');
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('returns 200 on successful deletion', async () => {
      const replyId = 'reply-123456';
      await RepliesTableTestHelper.addReply({ id: replyId, comment_id: commentId, content: 'isi reply', owner: currentUser });

      const server = await createServer(container);
      const res = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const result = JSON.parse(res.payload);
      expect(res.statusCode).toBe(200);
      expect(result.status).toBe('success');
    });

    it('returns 401 when no Authorization header', async () => {
      const replyId = 'dummy';
      const server = await createServer(container);

      const res = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      });

      const result = JSON.parse(res.payload);
      expect(res.statusCode).toBe(401);
      expect(result.message).toBe('Missing authentication');
    });

    it('returns 403 when deleting another user’s reply', async () => {
      const otherUser = 'user-12345';
      await UsersTableTestHelper.addUser({ id: otherUser, username: 'anotherUser', password: 'secret', fullname: 'not you' });

      const replyId = 'reply-123456';
      await RepliesTableTestHelper.addReply({ id: replyId, comment_id: commentId, content: 'isi reply', owner: otherUser });

      const server = await createServer(container);
      const res = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const result = JSON.parse(res.payload);
      expect(res.statusCode).toBe(403);
      expect(result.message).toBe('Anda tidak berhak menghapus reply ini');
    });

    it('returns 404 when reply is not found', async () => {
      const replyId = 'not-exist';
      const server = await createServer(container);

      const res = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const result = JSON.parse(res.payload);
      expect(res.statusCode).toBe(404);
      expect(result.message).toBe('Reply tidak ditemukan');
    });
  });
});
