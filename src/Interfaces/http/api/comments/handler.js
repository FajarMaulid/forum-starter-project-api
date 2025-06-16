const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const threadId = request.params.threadId;
    const content = request.payload.content;
    const owner = request.auth.credentials.id;

    const useCase = this._container.getInstance(AddCommentUseCase.name);
    const addedComment = await useCase.execute({ threadId, content, owner });

    const response = h.response({
      status: 'success',
      data: { addedComment },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const { commentId, threadId } = request.params;
    const userId = request.auth.credentials.id;

    const useCase = this._container.getInstance(DeleteCommentUseCase.name);
    await useCase.execute({ commentId, threadId, userId });

    const response = h.response({ status: 'success' });
    response.code(200);
    return response;
  }
}

module.exports = CommentsHandler;
