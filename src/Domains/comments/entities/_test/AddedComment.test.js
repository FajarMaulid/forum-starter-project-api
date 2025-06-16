const AddedComment = require('../AddedComment');

describe('AddedComment entity', () => {
  it('should throw an error if required properties are missing', () => {
    const input = { content: 'abc' };
    expect(() => new AddedComment(input)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw an error if property types are invalid', () => {
    const input = {
      id: true,
      content: 123,
      owner: 'abc',
    };
    expect(() => new AddedComment(input)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should correctly instantiate AddedComment with valid payload', () => {
    const input = {
      id: 'comment-123',
      content: 'isi komen',
      owner: 'user-123',
    };

    const comment = new AddedComment(input);

    expect(comment.id).toEqual(input.id);
    expect(comment.content).toEqual(input.content);
    expect(comment.owner).toEqual(input.owner);
  });
});
