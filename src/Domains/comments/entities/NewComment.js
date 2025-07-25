class NewComment {
  constructor(payload) {
    this._verifyPayload(payload);
    const { threadId, content, owner } = payload;
    this.threadId = threadId;
    this.content = content;
    this.owner = owner;
  }

  _verifyPayload({ threadId, content, owner }) {
    const missingField = !threadId || !content || !owner;
    const wrongType =
      typeof threadId !== 'string' ||
      typeof content !== 'string' ||
      typeof owner !== 'string';

    if (missingField) {
      throw new Error('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (wrongType) {
      throw new Error('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewComment;
