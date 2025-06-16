const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

const EndpointTestHelper = require('../../../../tests/EndpointTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('Integration /threads endpoint', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const auth = await EndpointTestHelper.getAccessTokenAndUserIdHelper();
    token = auth.accessToken;
    userId = auth.userId;
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await EndpointTestHelper.cleanTables();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /threads', () => {
    it('should respond 201 and return the created thread', async () => {
      const requestPayload = { title: 'judul', body: 'isi' };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(result.status).toBe('success');
      expect(result.data.addedThread).toBeDefined();
      expect(result.data.addedThread).toHaveProperty('id');
      expect(result.data.addedThread).toHaveProperty('title', requestPayload.title);
      expect(result.data.addedThread).toHaveProperty('owner', userId);
    });

    it('should respond 400 if a required field is missing', async () => {
      const requestPayload = { title: 'judul' };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(result.status).toBe('fail');
      expect(result.message).toBe('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should respond 400 if data types are invalid', async () => {
      const requestPayload = { title: 'judul', body: true };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(result.status).toBe('fail');
      expect(result.message).toBe('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should respond 401 if authentication is missing', async () => {
      const requestPayload = { title: 'judul', body: 'isi' };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      const result = JSON.parse(response.payload);
      expect(response.statusCode).toBe(401);
      expect(result.message).toBe('Missing authentication');
    });
  });

  describe('GET /threads/{threadId}', () => {
    it('should return 200 and thread details for an existing thread', async () => {
      const user1 = { id: 'user-1', username: 'username1', password: 'secret', fullname: 'full name 1' };
      const user2 = { id: 'user-2', username: 'username2', password: 'secret', fullname: 'full name 2' };
      await UsersTableTestHelper.addUser(user1);
      await UsersTableTestHelper.addUser(user2);

      const threadData = {
        id: 'thread-123',
        title: 'judul',
        body: 'isi',
        owner: user1.id,
        date: new Date('2024-10-01'),
      };
      await ThreadsTableTestHelper.addThread(threadData);

      const comment1 = {
        id: 'comment-1',
        threadId: threadData.id,
        content: 'komentar 1',
        date: new Date('2024-10-02'),
        owner: user1.id,
      };
      await CommentsTableTestHelper.addComment(comment1);

      const comment2 = {
        id: 'comment-2',
        threadId: threadData.id,
        content: 'komentar 2',
        date: new Date('2024-10-03'),
        owner: user2.id,
        isDeleted: true,
      };
      await CommentsTableTestHelper.addComment(comment2);

      const reply1 = {
        id: 'reply-1',
        commentId: comment1.id,
        content: 'balasan 1',
        date: new Date('2024-10-04'),
        owner: user1.id,
      };
      await RepliesTableTestHelper.addReply(reply1);

      const reply2 = {
        id: 'reply-2',
        commentId: comment1.id,
        content: 'balasan 2',
        date: new Date('2024-10-04'),
        owner: user2.id,
        isDeleted: true,
      };
      await RepliesTableTestHelper.addReply(reply2);

      const expectedThread = {
        id: threadData.id,
        title: threadData.title,
        body: threadData.body,
        date: threadData.date.toISOString(),
        username: user1.username,
        comments: [
          {
            id: comment1.id,
            content: comment1.content,
            date: comment1.date.toISOString(),
            username: user1.username,
            replies: [
              {
                id: reply1.id,
                content: reply1.content,
                date: reply1.date.toISOString(),
                username: user1.username,
              },
              {
                id: reply2.id,
                content: '**balasan telah dihapus**',
                date: reply2.date.toISOString(),
                username: user2.username,
              },
            ],
          },
          {
            id: comment2.id,
            content: '**komentar telah dihapus**',
            date: comment2.date.toISOString(),
            username: user2.username,
            replies: [],
          },
        ],
      };

      const server = await createServer(container);
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadData.id}`,
      });

      const result = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(result.status).toBe('success');
      expect(result.data.thread).toStrictEqual(expectedThread);
    });

    it('should respond 404 if the thread does not exist', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'GET',
        url: '/threads/not-found',
      });

      const result = JSON.parse(response.payload);
      expect(response.statusCode).toBe(404);
      expect(result.status).toBe('fail');
      expect(result.message).toBe('Thread tidak ditemukan');
    });
  });
});
