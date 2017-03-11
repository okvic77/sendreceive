var {
  Receiver
} = require('..');
var receiver = new Receiver("test", data => {
  // console.log('process', data)
  return Promise.resolve(true)
})