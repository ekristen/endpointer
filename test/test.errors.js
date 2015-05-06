var domain = require('domain');
var restify = require('restify');

var manager = require('../lib');

exports.setUp = function(done) {
  done();
};

exports.tearDown = function(done) {
  done();
};

exports.errorNoPathEndpoint = function(test) {
  var endpoints = new manager.EndpointManager();
  var server = restify.createServer();

  try {
    endpoints.addEndpoint({
      name: 'test',
      description: 'test',
      method: 'GET',
      fn: function (req, res, next) {
        res.send(200);
      }
    });

    endpoints.attach(server);
  } catch (e) {
    test.equal(e.message, "Path is required in an endpoint definition");
  }

  test.done();
};


exports.errorNoNameEndpoint = function(test) {
  var endpoints = new manager.EndpointManager();
  var server = restify.createServer();

  try {
    endpoints.addEndpoint({
      description: 'test',
      method: 'GET',
      path: '/test',
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


exports.errorNoMethodEndpoint = function(test) {
  var endpoints = new manager.EndpointManager();
  var server = restify.createServer();

  try {
    endpoints.addEndpoint({
      name: 'test',
      description: 'test',
      path: '/test',
      fn: function (req, res, next) {
        res.send(200);
      }
    });

    endpoints.attach(server);
  } catch (e) {
    test.equal(e.message, "Method is required in an endpoint definition");
  }

  test.done();
};


exports.errorNoFunctionEndpoint = function(test) {
  var endpoints = new manager.EndpointManager();
  var server = restify.createServer();

  try {
    endpoints.addEndpoint({
      name: 'test',
      description: 'test',
      path: '/test',
      method: 'GET'
    });

    endpoints.attach(server);
  } catch (e) {
    test.equal(e.message, "fn is required to define an endpoint");
  }

  test.done();
};
