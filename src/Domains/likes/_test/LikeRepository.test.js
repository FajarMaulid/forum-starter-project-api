const LikeRepository = require('../LikeRepository');

describe('LikeRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    const likeRepository = new LikeRepository();

    await expect(likeRepository.checkIfUserHasLikedComment({})).rejects.toThrowError(
      'Like_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(likeRepository.likeComment({})).rejects.toThrowError(
      'Like_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(likeRepository.unlikeComment({})).rejects.toThrowError(
      'Like_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
    await expect(likeRepository.countCommentLikes('')).rejects.toThrowError(
      'Like_REPOSITORY.METHOD_NOT_IMPLEMENTED',
    );
  });
});