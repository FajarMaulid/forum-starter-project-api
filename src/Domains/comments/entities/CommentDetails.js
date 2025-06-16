class CommentDetails {
  constructor(payload) {
    this._validatePayload(payload);

    const {
      id, username, date, content, replies,
    } = this._preparePayload(payload);

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
    this.replies = replies;
  }

  _validatePayload({
    id, username, date, content, replies, is_deleted: isDeleted,
  }) {
    const isMissing =
      !id || !username || !date || !content || !replies || isDeleted === undefined;
    const isInvalidType =
      typeof id !== 'string' ||
      typeof username !== 'string' ||
      !(date instanceof Date) ||
      typeof content !== 'string' ||
      !Array.isArray(replies) ||
      !replies.every((item) => typeof item === 'object' && item !== null) ||
      typeof isDeleted !== 'boolean';

    if (isMissing) {
      throw new Error('COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (isInvalidType) {
      throw new Error('COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _preparePayload({
    id, username, date, content, replies, is_deleted: isDeleted,
  }) {
    return {
      id,
      username,
      date,
      content: isDeleted ? '**komentar telah dihapus**' : content,
      replies,
    };
  }
}

module.exports = CommentDetails;
