const LikeUnlikeUseCase = require('../../../../Applications/use_case/LikeUnlikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;
    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: userId } = request.auth.credentials;

    const useCase = this._container.getInstance(LikeUnlikeUseCase.name);
    await useCase.execute({ threadId, commentId, userId });

    return h
      .response({ status: 'success' })
      .code(200);
  }
}

module.exports = LikesHandler;
