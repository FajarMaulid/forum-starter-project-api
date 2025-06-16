const AddedReply = require('../AddedReply');

describe('AddedReply Entity', () => {
  it('should throw an error if required fields are missing', () => {
    const data = { content: 'abc' };

    expect(() => new AddedReply(data)).toThrowError(
      'ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw an error if field types are incorrect', () => {
    const data = {
      id: 123,
      content: 'abc',
      owner: true,
    };

    expect(() => new AddedReply(data)).toThrowError(
      'ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should instantiate AddedReply properly with correct input', () => {
    const data = {
      id: 'reply-123',
      content: 'abc',
      owner: 'user-123',
    };

    const reply = new AddedReply(data);

    expect(reply.id).toBe(data.id);
    expect(reply.content).toBe(data.content);
    expect(reply.owner).toBe(data.owner);
  });
});
