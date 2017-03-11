import * as redis from "redis"

export default class Base {
  constructor(redis = "redis://localhost:11020") {
    this.redisUrl = redis;
  }
  createConnection() {
    return redis.createClient(this.redisUrl)
  }
}