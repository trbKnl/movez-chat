/* abstract */ class Store {
  findRoom(id) {}
  saveRoom(id, cardGame) {}
}


const SESSION_TTL = 24 * 60 * 60;
const mapSession = ([cardGame]) => cardGame ? { cardGame } : undefined;

export class RedisRoomStore extends Store {
  constructor(redisClient) {
    super();
    this.redisClient = redisClient;
  }

  findRoom(id) {
    return this.redisClient
      .hmget(`room:${id}`, "cardGame")
      .then(mapSession);
  }

  saveRoom(id, { cardGame }) {
    this.redisClient
      .multi()
      .hset(
        `room:${id}`,
        "cardGame",
        cardGame,
      )
      .expire(`room:${id}`, SESSION_TTL)
      .exec();
  }
}
