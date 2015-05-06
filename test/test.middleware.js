var restify = require('restify');

var manager = require('../lib');


function testMiddleware (req, res, next) {
  return next();
}

function testMiddleware2 (req, res, next) {
  return next();
}



exports.setUp = function(done) {
  done();
};

exports.tearDown = function(done) {
  done();
};

exports.singleMiddleware = function(test) {
  var endpoints = new manager.EndpointManager();
  var server = restify.createServer();

  try {
    endpoints.addEndpoint({
      name: 'test',
      description: 'test',
      method: 'GET',
      middleware: testMiddleware,
      fn: function (req, res, next) {
        return res.send(200);
      }
    });

    endpoints.attach(server);
  } catch (e) {
    test.equal(e.message, "Path is required in an endpoint definition");
  }

  test.done();
};


exports.multipleMiddleware = function(test) {
  var endpoints = new manager.EndpointManager();
  var server = restify.createServer();

  try {
    endpoints.addEndpoint({
      description: 'test',
      method: 'GET',
      path: '/test',
      middleware: [
        testMiddleware,
        testMiddleware2
      ],
      fn: function (req, res, next) {
        res.send(200);
      }
    });

    endpoints.attach(server);
  } catch (e) {
    test.equal(e.message, "Name is required in an endpoint definition");
  }

  test.done();
};
