const NewComment = require('../NewComment');

describe('NewComment entity', () => {
  it('should throw an error if required fields are missing', () => {
    const input = { content: 'abc' };

    expect(() => new NewComment(input)).toThrowError(
      'NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw an error if the types of fields are invalid', () => {
    const input = {
      threadId: 123,
      content: 'abc',
      owner: true,
    };

    expect(() => new NewComment(input)).toThrowError(
      'NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should instantiate correctly when given valid input', () => {
    const input = {
      threadId: 'thread-123',
      content: 'isi komen',
      owner: 'user321',
    };

    const result = new NewComment(input);

    expect(result.threadId).toEqual(input.threadId);
    expect(result.content).toEqual(input.content);
    expect(result.owner).toEqual(input.owner);
  });
});
