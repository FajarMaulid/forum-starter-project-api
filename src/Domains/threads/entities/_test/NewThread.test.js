const NewThread = require('../NewThread');

describe('NewThread Entity', () => {
  it('should throw an error when required properties are missing', () => {
    const input = { title: 'abc' };

    expect(() => new NewThread(input)).toThrowError(
      'NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw an error when property types are incorrect', () => {
    const input = {
      title: 123,
      body: 'abc',
      owner: true,
    };

    expect(() => new NewThread(input)).toThrowError(
      'NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create a NewThread object properly when given valid input', () => {
    const input = {
      title: 'judul',
      body: 'isi',
      owner: 'pemilik',
    };

    const thread = new NewThread(input);

    expect(thread.title).toEqual(input.title);
    expect(thread.body).toEqual(input.body);
    expect(thread.owner).toEqual(input.owner);
  });
});
