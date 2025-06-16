const createServer = require('../src/Infrastructures/http/createServer');
const container = require('../src/Infrastructures/container');

const UsersTableTestHelper = require('./UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('./AuthenticationsTableTestHelper');

const EndpointTestHelper = {
  async getAccessTokenAndUserIdHelper() {
    const server = await createServer(container);
    const rand = Math.floor(Math.random() * 1000);

    const payload = {
      username: `user${rand}`,
      password: `secret${rand}`,
      fullname: `full name ${rand}`,
    };

    const userRes = await server.inject({
      method: 'POST',
      url: '/users',
      payload,
    });

    const authRes = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: payload.username,
        password: payload.password,
      },
    });

    const { id: userId } = JSON.parse(userRes.payload).data.addedUser;
    const { accessToken } = JSON.parse(authRes.payload).data;
    return { accessToken, userId };
  },

  async cleanTables() {
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  },
};

module.exports = EndpointTestHelper;
