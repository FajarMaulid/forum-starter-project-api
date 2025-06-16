const NewReply = require('../NewReply');

describe('NewReply Entity', () => {
  it('should raise error if essential properties are missing', () => {
    const data = { content: 'abc' };

    expect(() => new NewReply(data)).toThrowError(
      'NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should raise error if data types are invalid', () => {
    const data = {
      commentId: 123,
      content: 'abc',
      owner: true,
    };

    expect(() => new NewReply(data)).toThrowError(
      'NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should build NewReply object as expected', () => {
    const data = {
      commentId: 'comment-123',
      content: 'abc',
      owner: 'user-123',
    };

    const reply = new NewReply(data);

    expect(reply.commentId).toBe(data.commentId);
    expect(reply.content).toBe(data.content);
    expect(reply.owner).toBe(data.owner);
  });
});
