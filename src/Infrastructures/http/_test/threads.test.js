const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

const EndpointTestHelper = require('../../../../tests/EndpointTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper.js');

describe('/threads endpoint', () => {
  let accessToken;
  let userId;

  beforeEach(async () => {
    const creds = await EndpointTestHelper.getAccessTokenAndUserIdHelper();
    accessToken = creds.accessToken;
    userId = creds.userId;
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await EndpointTestHelper.cleanTables();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /threads', () => {
    it('returns 201 and new thread data', async () => {
      const payload = { title: 'judul', body: 'isi' };
      const server = await createServer(container);

      const res = await server.inject({
        method: 'POST',
        url: '/threads',
        payload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const result = JSON.parse(res.payload);
      expect(res.statusCode).toBe(201);
      expect(result.status).toBe('success');
      expect(result.data.addedThread).toBeDefined();
      expect(result.data.addedThread).toHaveProperty('id');
      expect(result.data.addedThread).toHaveProperty('title', payload.title);
      expect(result.data.addedThread).toHaveProperty('owner', userId);
    });

    it('returns 400 when payload missing required field', async () => {
      const payload = { title: 'judul' };
      const server = await createServer(container);

      const res = await server.inject({
        method: 'POST',
        url: '/threads',
        payload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const result = JSON.parse(res.payload);
      expect(res.statusCode).toBe(400);
      expect(result.status).toBe('fail');
      expect(result.message).toBe('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('returns 400 when payload has wrong data types', async () => {
      const payload = { title: 'judul', body: true };
      const server = await createServer(container);

      const res = await server.inject({
        method: 'POST',
        url: '/threads',
        payload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const result = JSON.parse(res.payload);
      expect(res.statusCode).toBe(400);
      expect(result.status).toBe('fail');
      expect(result.message).toBe('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('returns 401 when no auth token provided', async () => {
      const payload = { title: 'judul', body: 'isi' };
      const server = await createServer(container);

      const res = await server.inject({
        method: 'POST',
        url: '/threads',
        payload,
      });

      const result = JSON.parse(res.payload);
      expect(res.statusCode).toBe(401);
      expect(result.message).toBe('Missing authentication');
    });
  });

  describe('GET /threads/{threadId}', () => {
    it('returns 200 and thread details when valid', async () => {
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
      const comment2 = {
        id: 'comment-2',
        threadId: threadData.id,
        content: 'komentar 2',
        date: new Date('2024-10-03'),
        owner: user2.id,
        isDeleted: true,
      };
      await CommentsTableTestHelper.addComment(comment1);
      await CommentsTableTestHelper.addComment(comment2);

      const reply1 = {
        id: 'reply-1',
        commentId: comment1.id,
        content: 'balasan 1',
        date: new Date('2024-10-04'),
        owner: user1.id,
      };
      const reply2 = {
        id: 'reply-2',
        commentId: comment1.id,
        content: 'balasan 2',
        date: new Date('2024-10-04'),
        owner: user2.id,
        isDeleted: true,
      };
      await RepliesTableTestHelper.addReply(reply1);
      await RepliesTableTestHelper.addReply(reply2);

      await LikesTableTestHelper.addLike({ id: 'like-1', commentId: comment1.id, userId: user1.id });
      await LikesTableTestHelper.addLike({ id: 'like-2', commentId: comment1.id, userId: user2.id });
      await LikesTableTestHelper.addLike({ id: 'like-3', commentId: comment2.id, userId: user1.id });

      const expected = {
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
            likeCount: 2,
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
            likeCount: 1,
            replies: [],
          },
        ],
      };

      const server = await createServer(container);
      const res = await server.inject({
        method: 'GET',
        url: `/threads/${threadData.id}`,
      });

      const result = JSON.parse(res.payload);
      expect(res.statusCode).toBe(200);
      expect(result.status).toBe('success');
      expect(result.data.thread).toStrictEqual(expected);
    });

    it('returns 404 when thread not found', async () => {
      const server = await createServer(container);
      const res = await server.inject({
        method: 'GET',
        url: '/threads/not-found',
      });

      const result = JSON.parse(res.payload);
      expect(res.statusCode).toBe(404);
      expect(result.status).toBe('fail');
      expect(result.message).toBe('Thread tidak ditemukan');
    });
  });
});
