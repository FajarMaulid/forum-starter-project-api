const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;
    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const threadId = request.params.threadId;
    const commentId = request.params.commentId;
    const content = request.payload.content;
    const owner = request.auth.credentials.id;

    const useCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await useCase.execute({ threadId, commentId, content, owner });

    const response = h.response({
      status: 'success',
      data: { addedReply },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request, h) {
    const threadId = request.params.threadId;
    const commentId = request.params.commentId;
    const replyId = request.params.replyId;
    const userId = request.auth.credentials.id;

    const useCase = this._container.getInstance(DeleteReplyUseCase.name);
    await useCase.execute({ threadId, commentId, replyId, userId });

    const response = h.response({ status: 'success' });
    response.code(200);
    return response;
  }
}

module.exports = RepliesHandler;
