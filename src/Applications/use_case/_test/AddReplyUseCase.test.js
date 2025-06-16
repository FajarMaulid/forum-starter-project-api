const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should handle the reply creation flow correctly', async () => {
    const inputPayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: 'isi konten',
      owner: 'user-123',
    };

    const expectedReply = new AddedReply({
      id: 'comment-123',
      content: inputPayload.content,
      owner: inputPayload.owner,
    });

    const threadRepoStub = new ThreadRepository();
    const commentRepoStub = new CommentRepository();
    const replyRepoStub = new ReplyRepository();

    threadRepoStub.verifyThreadExist = jest.fn().mockResolvedValue();
    commentRepoStub.verifyCommentExist = jest.fn().mockResolvedValue();
    replyRepoStub.addReply = jest.fn().mockResolvedValue({
      id: 'comment-123',
      content: inputPayload.content,
      owner: inputPayload.owner,
    });

    const useCase = new AddReplyUseCase({
      threadRepository: threadRepoStub,
      commentRepository: commentRepoStub,
      replyRepository: replyRepoStub,
    });

    const result = await useCase.execute(inputPayload);

    expect(threadRepoStub.verifyThreadExist).toHaveBeenCalledWith(inputPayload.threadId);
    expect(commentRepoStub.verifyCommentExist).toHaveBeenCalledWith(inputPayload.commentId);
    expect(replyRepoStub.addReply).toHaveBeenCalledWith(new NewReply({
      commentId: inputPayload.commentId,
      content: inputPayload.content,
      owner: inputPayload.owner,
    }));
    expect(result).toStrictEqual(expectedReply);
  });
});
