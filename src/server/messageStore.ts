import { Redis } from "ioredis"
import { z } from "zod"
      
const CONVERSATION_TTL = 24 * 60 * 60;


export const MessageSchema = z.object({
  content: z.string(),
  fromUserId: z.string(),
  toUserId: z.string(),
  fromSelf: z.boolean().optional(),
})

export type Message = z.infer<typeof MessageSchema>

export class RedisMessageStore {
  private redisClient: Redis

  constructor(redisClient: Redis) {
    this.redisClient = redisClient;
  }

  saveMessage(message: Message) {
    const value = JSON.stringify(message);
    this.redisClient
      .multi()
      .rpush(`messages:${message.fromUserId}`, value)
      .rpush(`messages:${message.toUserId}`, value)
      .expire(`messages:${message.fromUserId}`, CONVERSATION_TTL)
      .expire(`messages:${message.toUserId}`, CONVERSATION_TTL)
      .exec();
  }

  async findMessagesForUser(userId: string) {
    return this.redisClient
      .lrange(`messages:${userId}`, 0, -1)
      .then((results) => {
        return results.map((result) => JSON.parse(result));
      });
  }
}
