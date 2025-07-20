const CommentDetails = require('../CommentDetails');

describe('CommentDetails Entity', () => {
  it('throws if required properties are missing', () => {
    const incompletePayload = { content: 'abc' };
    expect(() => new CommentDetails(incompletePayload))
      .toThrowError('COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('throws if property types are invalid', () => {
    const invalidPayload = {
      id: 123,
      username: 99,
      date: 'now',
      content: true,
      replies: 'array',
      is_deleted: 'no',
      likeCount: '1',
    };
    expect(() => new CommentDetails(invalidPayload))
      .toThrowError('COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('constructs correctly for both undeleted and deleted comments', () => {
    const baseDate = new Date();
    const payloadActive = {
      id: 'comment-123',
      username: 'someone',
      date: baseDate,
      content: 'isi',
      replies: [{ content: 'something' }],
      is_deleted: false,
      likeCount: 1,
    };
    const payloadDeleted = {
      id: 'comment-1234',
      username: 'someone',
      date: baseDate,
      content: 'isi 2',
      replies: [{ content: 'something2' }],
      is_deleted: true,
      likeCount: 2,
    };

    const active = new CommentDetails({ ...payloadActive });
    expect(active.id).toBe(payloadActive.id);
    expect(active.username).toBe(payloadActive.username);
    expect(active.date).toBe(payloadActive.date);
    expect(active.content).toBe(payloadActive.content);
    expect(active.replies).toEqual(payloadActive.replies);
    expect(active.likeCount).toBe(payloadActive.likeCount);

    const deleted = new CommentDetails({ ...payloadDeleted });
    expect(deleted.id).toBe(payloadDeleted.id);
    expect(deleted.username).toBe(payloadDeleted.username);
    expect(deleted.date).toBe(payloadDeleted.date);
    expect(deleted.content).toBe('**komentar telah dihapus**');
    expect(deleted.replies).toEqual(payloadDeleted.replies);
    expect(deleted.likeCount).toBe(payloadDeleted.likeCount);
  });
});
