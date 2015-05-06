var domain = require('domain');
var restify = require('restify');

var manager = require('../lib');

exports.setUp = function(done) {
  done();
};

exports.tearDown = function(done) {
  done();
};


exports.addBasicEndpoint = function(test) {
  var endpoints = new manager.EndpointManager();
  var server = restify.createServer();

  endpoints.addEndpoint({
    name: 'test',
    description: 'test',
    method: 'GET',
    path: '/test',
    fn: function (req, res, next) {
      res.send(200);
    }
  });

  endpoints.attach(server);

  test.done();
};

exports.addBasicEndpointWithVersion = function(test) {
  var endpoints = new manager.EndpointManager();
  var server = restify.createServer();

  endpoints.addEndpoint({
    name: 'test',
    description: 'test',
    method: 'GET',
    version: '1.0.0',
    path: '/test',
    fn: function (req, res, next) {
      res.send(200);
    }
  });

  test.done();
};

exports.addMultipleMethodEndpoint = function(test) {
  var endpoints = new manager.EndpointManager();
  var server = restify.createServer();

  endpoints.addEndpoint({
    name: 'test',
    description: 'test',
    method: ['GET', 'POST'],
    path: '/test',
    fn: function (req, res, next) {
      res.send(200);
    }
  });

  test.done();
};

exports.addMultipleVersionsEndpoint = function(test) {
  var endpoints = new manager.EndpointManager();
  var server = restify.createServer();

  endpoints.addEndpoint({
    name: 'test',
    description: 'test',
    method: 'GET',
    version: ['1.0.0', '2.0.0'],
    path: '/test',
    fn: function (req, res, next) {
      res.send(200);
    }
  });

  test.done();
};

exports.addMultiplePathsEndpoint = function(test) {
  var endpoints = new manager.EndpointManager();
  var server = restify.createServer();

  endpoints.addEndpoint({
    name: 'test',
    description: 'test',
    method: 'GET',
    version: '1.0.0',
    path: ['/test', '/test2'],
    fn: function (req, res, next) {
      res.send(200);
    }
  });

  test.done();
};

exports.addMultipleVersionsMethodEndpoint = function(test) {
  var endpoints = new manager.EndpointManager();
  var server = restify.createServer();

  endpoints.addEndpoint({
    name: 'test',
    description: 'test',
    method: ['GET', 'POST'],
    version: ['1.0.0', '2.0.0'],
    path: ['/test', '/test2'],
    fn: function (req, res, next) {
      res.send(200);
    }
  });

  test.done();
};
