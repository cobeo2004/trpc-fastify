import { Redis } from "ioredis";

export class RedisService {
  private publisher: Redis | undefined;
  private subscriber: Redis | undefined;

  getPublisher() {
    if (!this.publisher) {
      this.publisher = new Redis({
        // Add your Redis configuration here
        host: "localhost",
        port: 6379,
      });
    }
    return this.publisher;
  }

  getSubscriber() {
    if (!this.subscriber) {
      this.subscriber = new Redis({
        // Add your Redis configuration here
        host: "localhost",
        port: 6379,
      });
    }
    return this.subscriber;
  }
}

export const redisService = new RedisService();
