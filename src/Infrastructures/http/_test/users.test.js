const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/users endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /users', () => {
    it('returns 201 and the created user', async () => {
      const payload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload,
      });

      const result = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(result.status).toEqual('success');
      expect(result.data.addedUser).toBeDefined();
    });

    it('returns 400 when a required field is missing', async () => {
      const payload = {
        fullname: 'Dicoding Indonesia',
        password: 'secret',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload,
      });

      const result = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(result.status).toEqual('fail');
      expect(result.message).toEqual(
        'tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'
      );
    });

    it('returns 400 when payload has wrong data types', async () => {
      const payload = {
        username: 'dicoding',
        password: 'secret',
        fullname: ['Dicoding Indonesia'],
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload,
      });

      const result = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(result.status).toEqual('fail');
      expect(result.message).toEqual(
        'tidak dapat membuat user baru karena tipe data tidak sesuai'
      );
    });

    it('returns 400 when username exceeds length limit', async () => {
      const payload = {
        username: 'dicodingindonesiadicodingindonesiadicodingindonesiadicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload,
      });

      const result = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(result.status).toEqual('fail');
      expect(result.message).toEqual(
        'tidak dapat membuat user baru karena karakter username melebihi batas limit'
      );
    });

    it('returns 400 when username contains invalid characters', async () => {
      const payload = {
        username: 'dicoding indonesia',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload,
      });

      const result = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(result.status).toEqual('fail');
      expect(result.message).toEqual(
        'tidak dapat membuat user baru karena username mengandung karakter terlarang'
      );
    });

    it('returns 400 when username is already taken', async () => {
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      const payload = {
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
        password: 'super_secret',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload,
      });

      const result = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(result.status).toEqual('fail');
      expect(result.message).toEqual('username tidak tersedia');
    });
  });
});
