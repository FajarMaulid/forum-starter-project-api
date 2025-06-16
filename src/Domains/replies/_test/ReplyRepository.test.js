const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository abstract class', () => {
  it('should throw an error if abstract methods are called', async () => {
    const instance = new ReplyRepository();

    await expect(instance.addReply({})).rejects.toThrowError(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(instance.verifyReplyExist('')).rejects.toThrowError(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(instance.verifyReplyOwner({})).rejects.toThrowError(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(instance.deleteReplyById('')).rejects.toThrowError(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(instance.getRepliesByCommentId('')).rejects.toThrowError(
      'REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
  });
});
