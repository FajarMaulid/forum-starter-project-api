const ThreadRepo = require('../../../Domains/threads/ThreadRepository');
const CommentRepo = require('../../../Domains/comments/CommentRepository');
const ReplyRepo = require('../../../Domains/replies/ReplyRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

const ThreadEntity = require('../../../Domains/threads/entities/ThreadDetails');
const CommentEntity = require('../../../Domains/comments/entities/CommentDetails');
const ReplyEntity = require('../../../Domains/replies/entities/ReplyDetails');

describe('GetThreadUseCase', () => {
  it('should execute the thread fetching process properly', async () => {
    const threadId = 'thread-123';

    const threadRepository = new ThreadRepo();
    const commentRepository = new CommentRepo();
    const replyRepository = new ReplyRepo();

    threadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    threadRepository.getThreadById = jest.fn().mockResolvedValue({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: new Date('2021-08-08T07:59:16.198Z'),
      username: 'dicoding',
    });

    commentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue([
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
    ]);

    replyRepository.getRepliesByCommentId = jest.fn((id) => {
      if (id === 'comment-123') {
        return Promise.resolve([
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
        ]);
      }
      return Promise.resolve([]);
    });

    const useCase = new GetThreadUseCase({
      threadRepository,
      commentRepository,
      replyRepository,
    });

    const result = await useCase.execute(threadId);

    expect(threadRepository.verifyThreadExist).toHaveBeenCalledWith(threadId);
    expect(threadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    expect(commentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
    expect(replyRepository.getRepliesByCommentId).toHaveBeenCalledWith('comment-123');
    expect(replyRepository.getRepliesByCommentId).toHaveBeenCalledWith('comment-234');

    expect(result).toEqual(
      new ThreadEntity({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: new Date('2021-08-08T07:59:16.198Z'),
        username: 'dicoding',
        comments: [
          new CommentEntity({
            id: 'comment-123',
            username: 'johndoe',
            date: new Date('2021-08-08T07:22:33.555Z'),
            content: 'sebuah comment',
            is_deleted: false,
            replies: [
              new ReplyEntity({
                id: 'reply-123',
                content: 'some racist reply',
                date: new Date('2021-08-08T07:59:48.766Z'),
                username: 'johndoe',
                is_deleted: true,
              }),
              new ReplyEntity({
                id: 'reply-234',
                content: 'sebuah balasan',
                date: new Date('2021-08-08T08:07:01.522Z'),
                username: 'dicoding',
                is_deleted: false,
              }),
            ],
          }),
          new CommentEntity({
            id: 'comment-234',
            username: 'dicoding',
            date: new Date('2021-08-08T07:26:21.338Z'),
            content: 'some racist comment',
            is_deleted: true,
            replies: [],
          }),
        ],
      })
    );
  });
});
