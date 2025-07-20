class LikeUnlikeUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute({ threadId, commentId, userId }) {
    await this._threadRepository.verifyThreadExist(threadId);
    await this._commentRepository.verifyCommentExist(commentId);

    const liked = await this._likeRepository.checkIfUserHasLikedComment({
      userId,
      commentId,
    });

    if (liked) {
      await this._likeRepository.unlikeComment({ userId, commentId });
    } else {
      await this._likeRepository.likeComment({ userId, commentId });
    }
  }
}

module.exports = LikeUnlikeUseCase;
