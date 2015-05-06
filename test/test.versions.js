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

  endpoints.addEndpoint({
    name: 'test',
    description: 'test',
    method: 'GET',
    path: '/test5',
    fn: function (req, res, next) {
      res.send(200, "no version");
      return next();
    }
  });
  endpoints.addEndpoint({
    name: 'Test Old Format 1',
    description: 'Test Old Format 1',
    method: 'GET',
    path: '/test5',
    version: '1.0.0',
    fn: function (req, res, next) {
      res.send(200, '1.0.0');
      return next();
    }
  });
  endpoints.addEndpoint({
    name: 'Test Old Format 2',
    description: 'Test Old Format 2',
    method: 'GET',
    path: '/test5',
    version: '1.0.1',
    fn: function (req, res, next) {
      res.send(200, '1.0.1');
      return next();
    }
  });
  endpoints.addEndpoint({
    name: 'Test Old Format 3',
    description: 'Test Old Format 3',
    method: 'GET',
    path: '/test5',
    version: '1.0.2',
    fn: function (req, res, next) {
      res.send(200, '1.0.2');
      return next();
    }
  });
  endpoints.addEndpoint({
    name: 'Test Old Format 3',
    description: 'Test Old Format 3',
    method: 'GET',
    path: '/test5',
    version: '2.0.0',
    fn: function (req, res, next) {
      res.send(200, '2.0.0');
      return next();
    }
  });
  endpoints.addEndpoint({
    name: 'Test Old Format 3',
    description: 'Test Old Format 3',
    method: 'GET',
    path: '/test5',
    version: '2.0.1',
    fn: function (req, res, next) {
      res.send(200, '2.0.1');
      return next();
    }
  });

  try {
    endpoints.attach(server);
  }
  catch (e) {
    console.log(e);
    process.exit(1);
  }

  server.listen(9999, function() {
    done();
  });
};

exports.tearDown = function(done) {
  server.close();
  client.close();
  done();
};

exports.noVersion = function(test) {
  client.get('/test5', function(err, req, res, data) {
    test.ifError(err);
    test.equal(res.statusCode, 200);
    test.equal(data, 'no version');
    test.done();
  });
};

exports.version1 = function(test) {
  var options = {
    path: '/test5',
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

exports.versionLike1 = function(test) {
  var options = {
    path: '/test5',
    headers: {
      'accept-version': '~1'
    }
  };
  
  client.get(options, function(err, req, res, data) {
    test.ifError(err);
    test.equal(res.statusCode, 200);
    test.equal(data, '1.0.2');
    test.done();
  });
};

exports.version2 = function(test) {
  var options = {
    path: '/test5',
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

exports.versionLike2 = function(test) {
  var options = {
    path: '/test5',
    headers: {
      'accept-version': '~2'
    }
  };
  
  client.get(options, function(err, req, res, data) {
    test.ifError(err);
    test.equal(res.statusCode, 200);
    test.equal(data, '2.0.1');
    test.done();
  });
};
