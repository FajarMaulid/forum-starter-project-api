const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const ClientError = require('../../Commons/exceptions/ClientError');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');
const users = require('../../Interfaces/http/api/users');
const authentications = require('../../Interfaces/http/api/authentications');
const threads = require('../../Interfaces/http/api/threads');
const comments = require('../../Interfaces/http/api/comments');
const replies = require('../../Interfaces/http/api/replies');
const likes = require('../../Interfaces/http/api/likes');

const createServer = async (container) => {
  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
  });

  await server.register([{ plugin: Jwt }]);

  const accessTokenKey = process.env.ACCESS_TOKEN_KEY;
  const accessTokenAge = Number(process.env.ACCESS_TOKEN_AGE);

  if (!accessTokenKey) {
    console.error('FATAL: ACCESS_TOKEN_KEY is not defined');
    process.exit(1);
  }
  if (Number.isNaN(accessTokenAge)) {
    console.error('FATAL: ACCESS_TOKEN_AGE is not a valid number');
    process.exit(1);
  }

  server.auth.strategy('forum_api_jwt', 'jwt', {
    keys: accessTokenKey,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: accessTokenAge,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
        username: artifacts.decoded.payload.username,
      },
    }),
  });

  await server.register([
    { plugin: users, options: { container } },
    { plugin: authentications, options: { container } },
    { plugin: threads, options: { container } },
    { plugin: comments, options: { container } },
    { plugin: replies, options: { container } },
    { plugin: likes, options: { container } },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      // Log original error and stack trace to terminal
      console.error('Request error:', response.message);
      console.error(response.stack);

      const translatedError = DomainErrorTranslator.translate(response);

      if (translatedError instanceof ClientError) {
        return h
          .response({
            status: 'fail',
            message: translatedError.message,
          })
          .code(translatedError.statusCode);
      }

      if (!translatedError.isServer) {
        return h.continue;
      }

      return h
        .response({
          status: 'error',
          message: 'terjadi kegagalan pada server kami',
        })
        .code(500);
    }

    return h.continue;
  });

  return server;
};

module.exports = createServer;
