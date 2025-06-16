const AddedThread = require('../AddedThread');

describe('AddedThread Entity', () => {
  it('should throw an error when required properties are missing', () => {
    const input = { title: 'abc' };

    expect(() => new AddedThread(input)).toThrowError(
      'ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw an error when property types are incorrect', () => {
    const input = {
      id: true,
      title: 123,
      owner: 'abc',
    };

    expect(() => new AddedThread(input)).toThrowError(
      'ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create an AddedThread object properly when given valid input', () => {
    const input = {
      id: 'thread-123',
      title: 'judul',
      owner: 'user-123',
    };

    const thread = new AddedThread(input);

    expect(thread.id).toEqual(input.id);
    expect(thread.title).toEqual(input.title);
    expect(thread.owner).toEqual(input.owner);
  });
});
