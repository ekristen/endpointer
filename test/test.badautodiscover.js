var restify = require('restify');

var manager = require('../lib');

var endpoints;
var server;
var client;

exports.setUp = function(done) {
  try {
    endpoints = new manager.EndpointManager({
      endpointpath: __dirname + '/endpoints_bad'
    });
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
  server = restify.createServer();
  client = restify.createStringClient({
    url: 'http://localhost:9999'
  });

  endpoints.attach(server);

  server.listen(9999, function() {
    done();
  });
}

exports.tearDown = function(done) {
  server.close();
  client.close();
  done();
}

exports.doesThisRun = function(test) {
  test.done();
}
