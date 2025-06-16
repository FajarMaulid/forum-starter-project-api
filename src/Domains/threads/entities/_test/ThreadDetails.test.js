const ThreadDetails = require('../ThreadDetails');

describe('ThreadDetails Entity', () => {
  it('should throw error when payload does not contain required properties', () => {
    const payload = {
      title: 'abc',
    };

    expect(() => new ThreadDetails(payload)).toThrowError(
      'THREAD_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload properties have incorrect data types', () => {
    const payload = {
      id: 123,
      title: 321,
      body: true,
      date: 'now',
      username: 99,
      comments: 'some comments',
    };

    expect(() => new ThreadDetails(payload)).toThrowError(
      'THREAD_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create ThreadDetails object correctly with valid payload', () => {
    const payload = {
      id: 'thread-123',
      title: 'judul',
      body: 'isi',
      date: new Date(),
      username: 'someone',
      comments: [{ content: 'some comment' }],
    };

    const threadDetails = new ThreadDetails(payload);

    expect(threadDetails.id).toEqual(payload.id);
    expect(threadDetails.title).toEqual(payload.title);
    expect(threadDetails.body).toEqual(payload.body);
    expect(threadDetails.date).toEqual(payload.date);
    expect(threadDetails.username).toEqual(payload.username);
    expect(threadDetails.comments).toEqual(payload.comments);
  });
});
