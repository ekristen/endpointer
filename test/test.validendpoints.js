var restify = require('restify');

var manager = require('../lib');

var endpoints;
var server;
var client;

exports.setUp = function(done) {
  endpoints = new manager.EndpointManager();
  server = restify.createServer();
  client = restify.createStringClient({
    url: 'http://localhost:9999'
  });

  server.listen(9999, function() {
    done();
  });
};

exports.tearDown = function(done) {
  server.close();
  client.close();
  done();
};


exports.checkTestEndpoint = function(test) {
  endpoints.addEndpoint({
    name: 'test',
    description: 'test',
    method: 'GET',
    path: '/test',
    fn: function (req, res, next) {
      res.send(200);
      return next();
    }
  });

  endpoints.attach(server);

  client.get('/test', function(err, req, res, data) {
    test.ifError(err);
    test.equal(res.statusCode, 200);
    test.done();
  });
};

exports.checkTest2Version1 = function(test) {

  endpoints.addEndpoint({
    name: 'test',
    description: 'test',
    method: 'GET',
    path: '/test2',
    version: ['1.0.0', '2.0.0'],
    fn: function (req, res, next) {
      res.send(200, req.headers['accept-version']);
      return next();
    }
  });

  endpoints.attach(server);

  var options = {
    path: '/test2',
    headers: {
      'accept-version': '1.0.0'
    }
  };

  client.get(options, function(err, req, res, data) {
    test.ifError(err);
    test.equal(res.statusCode, 200);
    test.equal(data, '1.0.0');
    test.done();
  });
};

exports.checkTest2Version2 = function(test) {
  
  endpoints.addEndpoint({
    name: 'test',
    description: 'test',
    method: 'GET',
    path: '/test2',
    version: ['1.0.0', '2.0.0'],
    fn: function (req, res, next) {
      res.send(200, req.headers['accept-version']);
      return next();
    }
  });

  endpoints.attach(server);

  var options = {
    path: '/test2',
    headers: {
      'accept-version': '2.0.0'
    }
  };

  client.get(options, function(err, req, res, data) {
    test.ifError(err);
    test.equal(res.statusCode, 200);
    test.equal(data, '2.0.0');
    test.done();
  });
};

exports.checkTest3Version1 = function(test) {
  endpoints.addEndpoint({
    name: 'test',
    description: 'test',
    method: 'GET',
    path: '/test3',
    version: ['1.0.0', '2.0.0'],
    fn: function (req, res, next) {
      res.send(200, req.headers['accept-version']);
      return next();
    },
    '1.0.0': function (req, res, next) {
      res.send(200, 'this is version 1');
      return next();
    },
    '2.0.0': function (req, res, next) {
      res.send(200, 'this is not version1 but version2');
      return next();
    }
  });

  endpoints.attach(server);

  var options = {
    path: '/test3',
    headers: {
      'accept-version': '1.0.0'
    }
  };

  client.get(options, function(err, req, res, data) {
    test.ifError(err);
    test.equal(res.statusCode, 200);
    test.equal(data, 'this is version 1');
    test.done();
  });
};


exports.checkTest3Version2 = function(test) {
  endpoints.addEndpoint({
    name: 'test',
    description: 'test',
    method: 'GET',
    path: '/test3',
    version: ['1.0.0', '2.0.0'],
    fn: function (req, res, next) {
      res.send(200, req.headers['accept-version']);
      return next();
    },
    '1.0.0': function (req, res, next) {
      res.send(200, 'this is version 1');
      return next();
    },
    '2.0.0': function (req, res, next) {
      res.send(200, 'this is not version1 but version2');
      return next();
    }
  });

  endpoints.attach(server);

  var options = {
    path: '/test3',
    headers: {
      'accept-version': '2.0.0'
    }
  };

  client.get(options, function(err, req, res, data) {
    test.ifError(err);
    test.equal(res.statusCode, 200);
    test.equal(data, 'this is not version1 but version2');
    test.done();
  });
};
