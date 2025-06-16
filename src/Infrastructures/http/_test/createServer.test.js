const createServer = require('../createServer');

describe('HTTP server integration', () => {
  it('returns 404 for unknown routes', async () => {
    const server = await createServer({});
    const response = await server.inject({ method: 'GET', url: '/unregisteredRoute' });
    expect(response.statusCode).toEqual(404);
  });

  it('returns 500 and error payload on server failure', async () => {
    const payload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    const server = await createServer({});
    const response = await server.inject({ method: 'POST', url: '/users', payload });

    const body = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(body.status).toEqual('error');
    expect(body.message).toEqual('terjadi kegagalan pada server kami');
  });
});
