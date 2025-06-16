const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should coordinate the comment deletion process properly', async () => {
    const input = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const threadRepoStub = new ThreadRepository();
    const commentRepoStub = new CommentRepository();

    threadRepoStub.verifyThreadExist = jest.fn().mockResolvedValue();
    commentRepoStub.verifyCommentExist = jest.fn().mockResolvedValue();
    commentRepoStub.verifyCommentOwner = jest.fn().mockResolvedValue();
    commentRepoStub.deleteCommentById = jest.fn().mockResolvedValue();

    const useCase = new DeleteCommentUseCase({
      threadRepository: threadRepoStub,
      commentRepository: commentRepoStub,
    });

    await useCase.execute(input);

    expect(threadRepoStub.verifyThreadExist).toHaveBeenCalledWith(input.threadId);
    expect(commentRepoStub.verifyCommentExist).toHaveBeenCalledWith(input.commentId);
    expect(commentRepoStub.verifyCommentOwner).toHaveBeenCalledWith({
      commentId: input.commentId,
      userId: input.userId,
    });
    expect(commentRepoStub.deleteCommentById).toHaveBeenCalledWith(input.commentId);
  });
});
