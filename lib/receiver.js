import Base from "./base"
import {queue, cargo, during, until, whilst, map} from "async"

export default class Agent extends Base {
  constructor(name, callback, redisUrl = "redis://localhost:11020") {
    super(redisUrl);
    this.name = name;
    this.connection = this.createConnection();
    this.connectionQuery = this.createConnection();
    this.callback = callback;
    this.limit = 2;
    this.process = queue(this.processJob.bind(this), this.limit);
    this.run();

    this.connection.subscribe(`agent:${name}`)
    this.connection.on("subscribe", this.subscribe.bind(this));
    this.connection.on("message", this.message.bind(this));
  }

  run() {
    this.queryAfter = false;
    this.isWorking = true;
    var check = true,
      processInit = 0;
    whilst(
      () => check,
      done => {
        this.getWorks(this.limit - 1, (err, jobs = []) => {
          if (jobs.length < this.limit) check = false;
          processInit += jobs.length;
          map(jobs, this.process.push, done)
        });
      },
      err => {
        if (this.queryAfter) {
          this.run();
        } else {
          this.isWorking = false;
        }
      }
    );
  }

  processJob(job, done) {
    this.connectionQuery.hgetall(`job:${job}`, (err, result) => {
      var redis = this.connectionQuery.multi().lrem(`agent:${this.name}`, 1, job).del(`job:${job}`);
      var out = this.callback(JSON.parse(result.data));
      out.then(out => {
        redis.publish(`events`, JSON.stringify({id: job, channel: this.name, end: out}))
        redis.publish(`events:${this.name}`, JSON.stringify({id: job, end: out}))
        redis.exec(done)
      }, err => {
        redis.publish(`events`, JSON.stringify({id: job, channel: this.name, err}))
        redis.publish(`events:${this.name}`, JSON.stringify({id: job, err}))
        redis.exec(done)
      });
    })
  }

  subscribe(channel, message) {

  }
  message(channel, message) {
    if (this.isWorking) this.queryAfter = true;
    else this.run();
  }
  getWorks(limit = 0, ...args) {
    return this.connectionQuery.lrange(`agent:${this.name}`, 0, limit, ...args)
  }
}

