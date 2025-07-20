const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const LikeUnlikeUseCase = require('../LikeUnlikeUseCase');

describe('LikeUnlikeUseCase', () => {
  it('should handle liking a comment when not previously liked', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const threadRepo = new ThreadRepository();
    const commentRepo = new CommentRepository();
    const likeRepo = new LikeRepository();

    threadRepo.verifyThreadExist = jest.fn().mockResolvedValue();
    commentRepo.verifyCommentExist = jest.fn().mockResolvedValue();
    likeRepo.checkIfUserHasLikedComment = jest.fn().mockResolvedValue(false);
    likeRepo.likeComment = jest.fn().mockResolvedValue();
    likeRepo.unlikeComment = jest.fn().mockResolvedValue();

    const useCase = new LikeUnlikeUseCase({
      threadRepository: threadRepo,
      commentRepository: commentRepo,
      likeRepository: likeRepo,
    });

    await useCase.execute(useCasePayload);

    expect(threadRepo.verifyThreadExist).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(commentRepo.verifyCommentExist).toHaveBeenCalledWith(useCasePayload.commentId);
    expect(likeRepo.checkIfUserHasLikedComment).toHaveBeenCalledWith({
      userId: useCasePayload.userId,
      commentId: useCasePayload.commentId,
    });
    expect(likeRepo.likeComment).toHaveBeenCalledWith({
      userId: useCasePayload.userId,
      commentId: useCasePayload.commentId,
    });
    expect(likeRepo.unlikeComment).not.toHaveBeenCalled();
  });

  it('should handle unliking a comment when already liked', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-1234',
    };

    const threadRepo = new ThreadRepository();
    const commentRepo = new CommentRepository();
    const likeRepo = new LikeRepository();

    threadRepo.verifyThreadExist = jest.fn().mockResolvedValue();
    commentRepo.verifyCommentExist = jest.fn().mockResolvedValue();
    likeRepo.checkIfUserHasLikedComment = jest.fn().mockResolvedValue(true);
    likeRepo.likeComment = jest.fn().mockResolvedValue();
    likeRepo.unlikeComment = jest.fn().mockResolvedValue();

    const useCase = new LikeUnlikeUseCase({
      threadRepository: threadRepo,
      commentRepository: commentRepo,
      likeRepository: likeRepo,
    });

    await useCase.execute(useCasePayload);

    expect(threadRepo.verifyThreadExist).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(commentRepo.verifyCommentExist).toHaveBeenCalledWith(useCasePayload.commentId);
    expect(likeRepo.checkIfUserHasLikedComment).toHaveBeenCalledWith({
      userId: useCasePayload.userId,
      commentId: useCasePayload.commentId,
    });
    expect(likeRepo.unlikeComment).toHaveBeenCalledWith({
      userId: useCasePayload.userId,
      commentId: useCasePayload.commentId,
    });
    expect(likeRepo.likeComment).not.toHaveBeenCalled();
  });
});
