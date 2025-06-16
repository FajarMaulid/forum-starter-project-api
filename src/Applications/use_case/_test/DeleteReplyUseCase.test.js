const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should handle reply deletion process properly', async () => {
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      userId: 'user-123',
    };

    const threadRepoMock = new ThreadRepository();
    const commentRepoMock = new CommentRepository();
    const replyRepoMock = new ReplyRepository();

    threadRepoMock.verifyThreadExist = jest.fn().mockResolvedValue();
    commentRepoMock.verifyCommentExist = jest.fn().mockResolvedValue();
    replyRepoMock.verifyReplyExist = jest.fn().mockResolvedValue();
    replyRepoMock.verifyReplyOwner = jest.fn().mockResolvedValue();
    replyRepoMock.deleteReplyById = jest.fn().mockResolvedValue();

    const useCase = new DeleteReplyUseCase({
      threadRepository: threadRepoMock,
      commentRepository: commentRepoMock,
      replyRepository: replyRepoMock,
    });

    await useCase.execute(payload);

    expect(threadRepoMock.verifyThreadExist).toHaveBeenCalledWith(payload.threadId);
    expect(commentRepoMock.verifyCommentExist).toHaveBeenCalledWith(payload.commentId);
    expect(replyRepoMock.verifyReplyExist).toHaveBeenCalledWith(payload.replyId);
    expect(replyRepoMock.verifyReplyOwner).toHaveBeenCalledWith({
      replyId: payload.replyId,
      userId: payload.userId,
    });
    expect(replyRepoMock.deleteReplyById).toHaveBeenCalledWith(payload.replyId);
  });
});
