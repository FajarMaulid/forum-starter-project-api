const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should properly handle the process of adding a comment', async () => {
    const input = {
      threadId: 'thread-123',
      content: 'isi konten',
      owner: 'user-123',
    };

    const expectedResult = new AddedComment({
      id: 'comment-123',
      content: input.content,
      owner: input.owner,
    });

    const threadRepoMock = new ThreadRepository();
    const commentRepoMock = new CommentRepository();

    threadRepoMock.verifyThreadExist = jest.fn()
      .mockResolvedValue();

    commentRepoMock.addComment = jest.fn()
      .mockResolvedValue({
        id: 'comment-123',
        content: input.content,
        owner: input.owner,
      });

    const addComment = new AddCommentUseCase({
      threadRepository: threadRepoMock,
      commentRepository: commentRepoMock,
    });

    const result = await addComment.execute(input);

    expect(threadRepoMock.verifyThreadExist).toHaveBeenCalledWith(input.threadId);
    expect(commentRepoMock.addComment).toHaveBeenCalledWith(new NewComment(input));
    expect(result).toStrictEqual(expectedResult);
  });
});
