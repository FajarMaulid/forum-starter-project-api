const pool = require('../../database/postgres/pool');
const ThreadRepoPg = require('../ThreadRepositoryPostgres');
const NewThread = require('../../../Domains/threads/entities/NewThread');

const UsersHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsHelper = require('../../../../tests/ThreadsTableTestHelper');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersHelper.addUser({
      id: 'user-123',
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    });
  });

  afterEach(async () => {
    await ThreadsHelper.cleanTable();
    await UsersHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread()', () => {
    it('stores a thread and retrieves it', async () => {
      const threadData = new NewThread({ title: 'judul', body: 'isi', owner: 'user-123' });
      const idGen = () => '123';
      const repo = new ThreadRepoPg(pool, idGen);

      await repo.addThread(threadData);

      const rows = await ThreadsHelper.findThreadById('thread-123');
      expect(rows).toHaveLength(1);
    });

    it('returns the newly added thread info', async () => {
      const threadData = new NewThread({ title: 'judul', body: 'isi', owner: 'user-123' });
      const idGen = () => '123';
      const repo = new ThreadRepoPg(pool, idGen);

      const added = await repo.addThread(threadData);
      expect(added).toStrictEqual({ id: 'thread-123', title: 'judul', owner: 'user-123' });
    });
  });

  describe('verifyThreadExist()', () => {
    it('throws NotFoundError if thread absent', async () => {
      const repo = new ThreadRepoPg(pool, () => '123');
      await expect(repo.verifyThreadExist('no-thread')).rejects.toThrow(NotFoundError);
    });

    it('resolves when thread exists', async () => {
      await ThreadsHelper.addThread({ id: 'thread-123', title: 'judul', body: 'isi', owner: 'user-123' });
      const repo = new ThreadRepoPg(pool, () => '123');
      await expect(repo.verifyThreadExist('thread-123')).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('getThreadById()', () => {
    it('fetches thread data accurately', async () => {
      const date = new Date();
      await ThreadsHelper.addThread({ id: 'thread-123', title: 'judul', body: 'isi', owner: 'user-123', date });
      const repo = new ThreadRepoPg(pool, () => '123');

      const thread = await repo.getThreadById('thread-123');
      expect(thread).toMatchObject({ id: 'thread-123', title: 'judul', body: 'isi', date, username: 'dicoding' });
    });
  });
});
