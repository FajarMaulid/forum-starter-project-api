class CommentDetails {
  constructor(payload) {
    this._validateProps(payload);

    const {
      id,
      username,
      date,
      content,
      replies,
      likeCount,
    } = this._normalizeProps(payload);

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
    this.likeCount = likeCount;
    this.replies = replies;
  }

  _validateProps({
    id,
    username,
    date,
    content,
    replies,
    is_deleted: isDeleted,
    likeCount,
  }) {
    const missing =
      !id ||
      !username ||
      !date ||
      !content ||
      replies === undefined ||
      isDeleted === undefined ||
      likeCount === undefined;
    if (missing) {
      throw new Error('COMMENT_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    const wrongType =
      typeof id !== 'string' ||
      typeof username !== 'string' ||
      !(date instanceof Date) ||
      typeof content !== 'string' ||
      typeof likeCount !== 'number' ||
      typeof isDeleted !== 'boolean' ||
      !Array.isArray(replies) ||
      replies.some((r) => typeof r !== 'object' || r === null);
    if (wrongType) {
      throw new Error('COMMENT_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _normalizeProps({
    id,
    username,
    date,
    content,
    replies,
    is_deleted: isDeleted,
    likeCount,
  }) {
    return {
      id,
      username,
      date,
      content: isDeleted ? '**komentar telah dihapus**' : content,
      likeCount,
      replies,
    };
  }
}

module.exports = CommentDetails;
