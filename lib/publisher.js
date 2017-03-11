

import Base from "./base";
import {series} from "async";
import * as EventEmitter from "events";

export default class Publisher extends Base {
  constructor(name, redisUrl = "redis://localhost:11020") {
    super(redisUrl);
    this.name = name;
    this.connection = this.createConnection();

    this.events = this.createConnection();
    this.events.subscribe(name ? `events:${name}` : `events`)
    this.events.on("subscribe", this.subscribe.bind(this));
    this.events.on("message", this.message.bind(this));

    this.eventsList = new EventEmitter();
  }

  subscribe(channel, message) {

  }
  message(channel, message) { // fix global emitter
    var data = JSON.parse(message);
    var newData = Object.assign({}, data)
    delete newData.id;
    this.eventsList.emit(data.id, newData)
  }

  add(...args) {
    return this.publish(this.name, ...args)
  }

  publish(channel, job, listen = false) {
    var exec = this.connection.multi();
    job.redis(exec)


    if (listen) {
      var proxy = data => {
        Object.keys(data).map(key => job.emit(key, data[key]))
        if (data.end || data.err)
          this.eventsList.removeListener(job.id, proxy)
      }
      this.eventsList.on(job.id, proxy)
    }

    exec.lpush(`agent:${channel}`, job.id)
    exec.publish(`agent:${channel}`, job.id)
    return new Promise((resolve, reject) => {
      exec.exec((err, out) => {
        if (err) reject(err);
        else resolve(out);
      })
    });
  }
}