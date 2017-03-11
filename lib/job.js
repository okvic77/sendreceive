import * as uuid from "uuid"
import * as EventEmitter from "events";

export default class Job extends EventEmitter {
  constructor(data, options = {}) {
    super()
    this.id = uuid.v4();
    this.data = data;
    this.options = options;
  }
  redis(redis) {
    var data = ['data', JSON.stringify(this.data)];
    Object.keys(this.options).forEach(option => {
      data.push(option, this.options[option])
    });
    return redis.hmset(`job:${this.id}`, ...data)
  }
}