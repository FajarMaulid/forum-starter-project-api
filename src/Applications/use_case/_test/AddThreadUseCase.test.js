const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should correctly handle adding a thread', async () => {
    const input = {
      title: 'judul',
      body: 'isi',
      owner: 'user-123',
    };

    const expectedResult = new AddedThread({
      id: 'thread-123',
      title: input.title,
      owner: input.owner,
    });

    const threadRepoMock = new ThreadRepository();

    threadRepoMock.addThread = jest.fn().mockResolvedValue({
      id: 'thread-123',
      title: input.title,
      owner: input.owner,
    });

    const useCaseInstance = new AddThreadUseCase({
      threadRepository: threadRepoMock,
    });

    const result = await useCaseInstance.execute(input);

    expect(threadRepoMock.addThread).toHaveBeenCalledWith(new NewThread(input));
    expect(result).toStrictEqual(expectedResult);
  });
});
