var {Publisher, Job} = require("..")
var publisher = new Publisher("test")


function fake(){
  var job = new Job({ok : true})
  publisher.add(job).then(data => {
    console.log(data)
    setTimeout(fake, 100)
  });
}
fake()


// var profiler = require('v8-profiler');
