const ReplyDetails = require('../ReplyDetails');

describe('ReplyDetails Entity', () => {
  it('should throw error if required fields are missing', () => {
    const input = { content: 'abc' };

    expect(() => new ReplyDetails(input)).toThrowError(
      'REPLY_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error if data types are incorrect', () => {
    const input = {
      id: 123,
      content: true,
      date: 'now',
      username: 99,
      is_deleted: 'yes',
    };

    expect(() => new ReplyDetails(input)).toThrowError(
      'REPLY_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should construct ReplyDetails object properly', () => {
    const input1 = {
      id: 'reply-123',
      content: 'isi reply',
      date: new Date(),
      username: 'someone',
      is_deleted: false,
    };

    const input2 = {
      id: 'reply-1234',
      content: 'isi reply 2',
      date: new Date(),
      username: 'someone',
      is_deleted: true,
    };

    const reply1 = new ReplyDetails(input1);
    const reply2 = new ReplyDetails(input2);

    expect(reply1.id).toBe(input1.id);
    expect(reply1.username).toBe(input1.username);
    expect(reply1.date).toBe(input1.date);
    expect(reply1.content).toBe(input1.content);

    expect(reply2.id).toBe(input2.id);
    expect(reply2.username).toBe(input2.username);
    expect(reply2.date).toBe(input2.date);
    expect(reply2.content).toBe('**balasan telah dihapus**');
  });
});
