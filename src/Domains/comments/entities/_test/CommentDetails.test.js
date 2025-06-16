const CommentDetails = require('../CommentDetails');

describe('CommentDetails entity', () => {
  it('should throw an error if required fields are missing', () => {
    const input = { content: 'abc' };

    expect(() => new CommentDetails(input)).toThrowError(
      'COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw an error if field types are incorrect', () => {
    const input = {
      id: 123,
      username: 99,
      date: 'now',
      content: true,
      replies: 'array',
      is_deleted: 'no',
    };

    expect(() => new CommentDetails(input)).toThrowError(
      'COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should properly construct CommentDetails instance', () => {
    const validData1 = {
      id: 'comment-123',
      username: 'someone',
      date: new Date(),
      content: 'isi',
      replies: [{ content: 'something' }],
      is_deleted: false,
    };

    const validData2 = {
      id: 'comment-1234',
      username: 'someone',
      date: new Date(),
      content: 'isi 2',
      replies: [{ content: 'something2' }],
      is_deleted: true,
    };

    const result1 = new CommentDetails(validData1);
    const result2 = new CommentDetails(validData2);

    expect(result1.id).toEqual(validData1.id);
    expect(result1.username).toEqual(validData1.username);
    expect(result1.date).toEqual(validData1.date);
    expect(result1.content).toEqual(validData1.content);
    expect(result1.replies).toEqual(validData1.replies);

    expect(result2.id).toEqual(validData2.id);
    expect(result2.username).toEqual(validData2.username);
    expect(result2.date).toEqual(validData2.date);
    expect(result2.content).toEqual('**komentar telah dihapus**');
    expect(result2.replies).toEqual(validData2.replies);
  });
});
