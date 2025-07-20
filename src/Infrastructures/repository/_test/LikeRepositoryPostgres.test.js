const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper.js');

describe('LikeRepositoryPostgres', () => {
  const userA = {
    id: 'user-123',
    username: 'username1',
    password: 'secret',
    fullname: 'full name 1',
  };
  const userB = {
    id: 'user-321',
    username: 'username2',
    password: 'secret',
    fullname: 'full name 2',
  };
  const threadData = {
    id: 'thread-123',
    title: 'judul',
    body: 'isi',
    owner: 'user-123',
  };
  const commentData = {
    id: 'comment-123',
    thread_id: 'thread-123',
    content: 'isi komen',
    owner: 'user-123',
  };

  beforeAll(async () => {
    await UsersTableTestHelper.addUser(userA);
    await UsersTableTestHelper.addUser(userB);
    await ThreadsTableTestHelper.addThread(threadData);
    await CommentsTableTestHelper.addComment(commentData);
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('checkIfUserHasLikedComment()', () => {
    it('returns true when a like exists', async () => {
      await LikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: commentData.id,
        userId: userA.id,
        date: new Date(),
      });
      const repo = new LikeRepositoryPostgres(pool, () => '123');
      const hasLiked = await repo.checkIfUserHasLikedComment({
        commentId: commentData.id,
        userId: userA.id,
      });
      expect(hasLiked).toBe(true);
    });

    it('returns false when no like exists', async () => {
      const repo = new LikeRepositoryPostgres(pool, () => '123');
      const hasLiked = await repo.checkIfUserHasLikedComment({
        commentId: commentData.id,
        userId: userA.id,
      });
      expect(hasLiked).toBe(false);
    });
  });

  describe('likeComment()', () => {
    it('inserts a new like record', async () => {
      const repo = new LikeRepositoryPostgres(pool, () => '123');
      await repo.likeComment({
        commentId: commentData.id,
        userId: userA.id,
      });
      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(1);
    });
  });

  describe('unlikeComment()', () => {
    it('removes the like record', async () => {
      const likeEntry = {
        id: 'like-123',
        commentId: commentData.id,
        userId: userA.id,
        date: new Date(),
      };
      await LikesTableTestHelper.addLike(likeEntry);
      const repo = new LikeRepositoryPostgres(pool, () => '123');
      await repo.unlikeComment(likeEntry);
      const likes = await LikesTableTestHelper.findLikeById(likeEntry.id);
      expect(likes).toHaveLength(0);
    });
  });

  describe('countCommentLikes()', () => {
    it('correctly counts all likes for a comment', async () => {
      await LikesTableTestHelper.addLike({
        id: 'like-123',
        commentId: commentData.id,
        userId: userA.id,
        date: new Date(),
      });
      await LikesTableTestHelper.addLike({
        id: 'like-1234',
        commentId: commentData.id,
        userId: userB.id,
        date: new Date(),
      });
      const repo = new LikeRepositoryPostgres(pool, () => '123');
      const count = await repo.countCommentLikes(commentData.id);
      expect(count).toBe(2);
    });
  });
});
