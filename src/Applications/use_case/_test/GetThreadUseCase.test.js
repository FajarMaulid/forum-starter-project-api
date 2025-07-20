const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');
const CommentDetails = require('../../../Domains/comments/entities/CommentDetails');
const ReplyDetails = require('../../../Domains/replies/entities/ReplyDetails');

describe('GetThreadUseCase', () => {
  it('correctly orchestrates fetching a thread with its comments, replies, and like counts', async () => {
    const threadId = 'thread-123';

    const threadRepoMock = new ThreadRepository();
    const commentRepoMock = new CommentRepository();
    const likeRepoMock = new LikeRepository();
    const replyRepoMock = new ReplyRepository();

    const threadData = {
      id: threadId,
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: new Date('2021-08-08T07:59:16.198Z'),
      username: 'dicoding',
    };
    const commentsData = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: new Date('2021-08-08T07:22:33.555Z'),
        content: 'sebuah comment',
        is_deleted: false,
      },
      {
        id: 'comment-234',
        username: 'dicoding',
        date: new Date('2021-08-08T07:26:21.338Z'),
        content: 'some racist comment',
        is_deleted: true,
      },
    ];
    const repliesFor123 = [
      {
        id: 'reply-123',
        content: 'some racist reply',
        date: new Date('2021-08-08T07:59:48.766Z'),
        username: 'johndoe',
        is_deleted: true,
      },
      {
        id: 'reply-234',
        content: 'sebuah balasan',
        date: new Date('2021-08-08T08:07:01.522Z'),
        username: 'dicoding',
        is_deleted: false,
      },
    ];

    threadRepoMock.verifyThreadExist = jest.fn(() => Promise.resolve());
    threadRepoMock.getThreadById = jest.fn(() => Promise.resolve(threadData));
    commentRepoMock.getCommentsByThreadId = jest.fn(() => Promise.resolve(commentsData));
    likeRepoMock.countCommentLikes = jest.fn((cid) =>
      Promise.resolve(cid === 'comment-123' ? 1 : 2)
    );
    replyRepoMock.getRepliesByCommentId = jest.fn((cid) =>
      Promise.resolve(cid === 'comment-123' ? repliesFor123 : [])
    );

    const useCase = new GetThreadUseCase({
      threadRepository: threadRepoMock,
      commentRepository: commentRepoMock,
      likeRepository: likeRepoMock,
      replyRepository: replyRepoMock,
    });

    const result = await useCase.execute(threadId);

    expect(threadRepoMock.verifyThreadExist).toHaveBeenCalledWith(threadId);
    expect(threadRepoMock.getThreadById).toHaveBeenCalledWith(threadId);
    expect(commentRepoMock.getCommentsByThreadId).toHaveBeenCalledWith(threadId);

    expect(replyRepoMock.getRepliesByCommentId).toHaveBeenCalledTimes(2);
    expect(replyRepoMock.getRepliesByCommentId).toHaveBeenNthCalledWith(1, 'comment-123');
    expect(replyRepoMock.getRepliesByCommentId).toHaveBeenNthCalledWith(2, 'comment-234');

    expect(likeRepoMock.countCommentLikes).toHaveBeenCalledTimes(2);
    expect(likeRepoMock.countCommentLikes).toHaveBeenNthCalledWith(1, 'comment-123');
    expect(likeRepoMock.countCommentLikes).toHaveBeenNthCalledWith(2, 'comment-234');

    expect(result).toEqual(
      new ThreadDetails({
        ...threadData,
        comments: [
          new CommentDetails({
            ...commentsData[0],
            likeCount: 1,
            replies: repliesFor123.map(r => new ReplyDetails(r)),
          }),
          new CommentDetails({
            ...commentsData[1],
            likeCount: 2,
            replies: [],
          }),
        ],
      })
    );
  });
});
