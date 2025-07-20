const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

const EndpointTestHelper = require('../../../../tests/EndpointTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper.js');

describe('/threads endpoint', () => {
  let token;
  let user;

  const sampleThread = {
    id: 'thread-123',
    title: 'judul',
    body: 'isi',
  };

  const sampleComment = {
    id: 'comment-123',
    thread_id: sampleThread.id,
    content: 'isi komen',
  };

  beforeAll(async () => {
    const creds = await EndpointTestHelper.getAccessTokenAndUserIdHelper();
    token = creds.accessToken;
    user = creds.userId;

    await ThreadsTableTestHelper.addThread({ ...sampleThread, owner: user });
    await CommentsTableTestHelper.addComment({ ...sampleComment, owner: user });
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await EndpointTestHelper.cleanTables();
    await pool.end();
  });

  describe('PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('responds 200 when liking a comment', async () => {
      const srv = await createServer(container);

      const res = await srv.inject({
        method: 'PUT',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/likes`,
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = JSON.parse(res.payload);
      expect(res.statusCode).toBe(200);
      expect(payload.status).toBe('success');
      expect(await LikesTableTestHelper.countCommentLikes(sampleComment.id)).toBe(1);
    });

    it('responds 200 when unliking on second call', async () => {
      const srv = await createServer(container);

      await srv.inject({
        method: 'PUT',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/likes`,
        headers: { Authorization: `Bearer ${token}` },
      });
      const secondRes = await srv.inject({
        method: 'PUT',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/likes`,
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload2 = JSON.parse(secondRes.payload);
      expect(secondRes.statusCode).toBe(200);
      expect(payload2.status).toBe('success');
      expect(await LikesTableTestHelper.countCommentLikes(sampleComment.id)).toBe(0);
    });

    it('responds 401 without authentication', async () => {
      const srv = await createServer(container);

      const res = await srv.inject({
        method: 'PUT',
        url: `/threads/${sampleThread.id}/comments/${sampleComment.id}/likes`,
      });

      const payload = JSON.parse(res.payload);
      expect(res.statusCode).toBe(401);
      expect(payload.message).toBe('Missing authentication');
    });

    it('responds 404 if thread not found', async () => {
      const srv = await createServer(container);

      const res = await srv.inject({
        method: 'PUT',
        url: `/threads/not-found/comments/${sampleComment.id}/likes`,
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = JSON.parse(res.payload);
      expect(res.statusCode).toBe(404);
      expect(payload.message).toBe('Thread tidak ditemukan');
    });

    it('responds 404 if comment not found', async () => {
      const srv = await createServer(container);

      const res = await srv.inject({
        method: 'PUT',
        url: `/threads/${sampleThread.id}/comments/not-found/likes`,
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = JSON.parse(res.payload);
      expect(res.statusCode).toBe(404);
      expect(payload.message).toBe('Comment tidak ditemukan');
    });
  });
});
