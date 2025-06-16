const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

const EndpointTestHelper = require('../../../../tests/EndpointTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('Integration /threads/{threadId}/comments', () => {
  let token;
  let ownerId;
  const testThreadId = 'thread-123';

  beforeEach(async () => {
    const authInfo = await EndpointTestHelper.getAccessTokenAndUserIdHelper();
    token = authInfo.accessToken;
    ownerId = authInfo.userId;

    await ThreadsTableTestHelper.addThread({
      id: testThreadId,
      title: 'judul',
      body: 'isi',
      owner: ownerId,
    });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await EndpointTestHelper.cleanTables();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /threads/{threadId}/comments', () => {
    it('returns 201 and the stored comment', async () => {
      const body = { content: 'Isi komen' };
      const server = await createServer(container);

      const res = await server.inject({
        method: 'POST',
        url: `/threads/${testThreadId}/comments`,
        payload: body,
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = JSON.parse(res.payload);
      expect(res.statusCode).toEqual(201);
      expect(json.status).toEqual('success');
      expect(json.data.addedComment).toBeDefined();
      expect(json.data.addedComment).toHaveProperty('id');
      expect(json.data.addedComment).toHaveProperty('content', body.content);
      expect(json.data.addedComment).toHaveProperty('owner', ownerId);
    });

    it('returns 400 when body misses required field', async () => {
      const body = {};
      const server = await createServer(container);

      const res = await server.inject({
        method: 'POST',
        url: `/threads/${testThreadId}/comments`,
        payload: body,
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = JSON.parse(res.payload);
      expect(res.statusCode).toEqual(400);
      expect(json.status).toEqual('fail');
      expect(json.message).toEqual(
        'tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada'
      );
    });

    it('returns 400 when body has wrong data types', async () => {
      const body = { content: true };
      const server = await createServer(container);

      const res = await server.inject({
        method: 'POST',
        url: `/threads/${testThreadId}/comments`,
        payload: body,
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = JSON.parse(res.payload);
      expect(res.statusCode).toEqual(400);
      expect(json.status).toEqual('fail');
      expect(json.message).toEqual(
        'tidak dapat membuat comment baru karena tipe data tidak sesuai'
      );
    });

    it('returns 401 when auth token is missing', async () => {
      const body = { content: 'Isi komen' };
      const server = await createServer(container);

      const res = await server.inject({
        method: 'POST',
        url: `/threads/${testThreadId}/comments`,
        payload: body,
      });

      const json = JSON.parse(res.payload);
      expect(res.statusCode).toEqual(401);
      expect(json.message).toEqual('Missing authentication');
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('returns 200 when deletion is successful', async () => {
      const commentId = 'comment-123456';
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread_id: testThreadId,
        content: 'isi komen',
        owner: ownerId,
      });

      const server = await createServer(container);
      const res = await server.inject({
        method: 'DELETE',
        url: `/threads/${testThreadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = JSON.parse(res.payload);
      expect(res.statusCode).toEqual(200);
      expect(json.status).toEqual('success');
    });

    it('returns 401 when no auth token provided', async () => {
      const commentId = 'dummy';
      const server = await createServer(container);

      const res = await server.inject({
        method: 'DELETE',
        url: `/threads/${testThreadId}/comments/${commentId}`,
      });

      const json = JSON.parse(res.payload);
      expect(res.statusCode).toEqual(401);
      expect(json.message).toEqual('Missing authentication');
    });

    it('returns 403 when user is not the owner', async () => {
      const anotherUser = 'user-12345';
      await UsersTableTestHelper.addUser({
        id: anotherUser,
        username: 'anotherUser',
        password: 'secret',
        fullname: 'not you',
      });

      const commentId = 'comment-12345';
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread_id: testThreadId,
        content: 'isi komen',
        owner: anotherUser,
      });

      const server = await createServer(container);
      const res = await server.inject({
        method: 'DELETE',
        url: `/threads/${testThreadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = JSON.parse(res.payload);
      expect(res.statusCode).toEqual(403);
      expect(json.message).toEqual(
        'Anda tidak berhak menghapus comment ini'
      );
    });

    it('returns 404 when the comment does not exist', async () => {
      const commentId = 'not-exist';
      const server = await createServer(container);

      const res = await server.inject({
        method: 'DELETE',
        url: `/threads/${testThreadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = JSON.parse(res.payload);
      expect(res.statusCode).toEqual(404);
      expect(json.message).toEqual('Comment tidak ditemukan');
    });
  });
});
