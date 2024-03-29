import { Redis } from "ioredis"
import { z } from "zod"

const SESSION_TTL = 24 * 60 * 60;


export const UserSessionDataSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  gameId: z.string(),
  connected: z.boolean(),
});

export type UserSessionData = z.infer<typeof UserSessionDataSchema>


export class RedisSessionStore {
  private redisClient: Redis;

  constructor(redisClient: Redis) {
    this.redisClient = redisClient;
  }

  async findSession(sessionId: string): Promise<UserSessionData | undefined> {
    const [ userId, connectedString, gameId ] = await this.redisClient.hmget(`session:${sessionId}`, "userId", "connected", "gameId")
    const connected = connectedString === "true" ? true : false;
    const result = UserSessionDataSchema.safeParse({sessionId, userId, connected, gameId})
    if (result.success) {
      return result.data
    } else {
      return undefined
    }
  }

  updateSessionField(sessionId: string, fieldName: string, value: any): void {
    this.redisClient
      .hset(`session:${sessionId}`, fieldName, value)
  }

  saveSession(userSessionData: UserSessionData): void {
    console.log("SAVED SESSION")
    const { sessionId, userId, connected, gameId } = userSessionData
    this.redisClient
      .multi()
      .hset(
        `session:${sessionId}`,
        "userId",
        userId,
        "connected",
        connected.toString(),
        "gameId",
        gameId
      )
      .expire(`session:${sessionId}`, SESSION_TTL)
      .exec();
  }
}
