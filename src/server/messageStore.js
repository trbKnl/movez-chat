/* abstract */ class MessageStore {
  saveMessage(message) {}
  findMessagesForUser(userid) {}
}

export class InMemoryMessageStore extends MessageStore {
  constructor() {
    super();
    this.messages = [];
  }

  saveMessage(message) {
    this.messages.push(message);
  }

  findMessagesForUser(userid) {
    return this.messages.filter(
      ({ from, to }) => from === userid || to === userID
    );
  }
}

const CONVERSATION_TTL = 24 * 60 * 60;

export class RedisMessageStore extends MessageStore {
  constructor(redisClient) {
    super();
    this.redisClient = redisClient;
  }

  saveMessage(message) {
    const value = JSON.stringify(message);
    this.redisClient
      .multi()
      .rpush(`messages:${message.from}`, value)
      .rpush(`messages:${message.to}`, value)
      .expire(`messages:${message.from}`, CONVERSATION_TTL)
      .expire(`messages:${message.to}`, CONVERSATION_TTL)
      .exec();
  }

  findMessagesForUser(userid) {
    return this.redisClient
      .lrange(`messages:${userid}`, 0, -1)
      .then((results) => {
        return results.map((result) => JSON.parse(result));
      });
  }
}
