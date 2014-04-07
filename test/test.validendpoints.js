var domain = require('domain');
var restify = require('restify');

var manager = require('../lib');

var endpoints = new manager.EndpointManager();
var server = restify.createServer();
var client = restify.createStringClient({
  url: 'http://localhost:9999'
});

exports.setUp = function(done) {
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

  server.listen(9999, function() {
    done();
  });
}

exports.tearDown = function(done) {
  server.close();
  client.close();
  done();
}

exports.checkTestEndpoint = function(test) {
  client.get('/test', function(err, req, res, data) {
    test.ifError(err);
    test.equal(res.statusCode, 200);
    test.done();
  });
}

exports.checkTest2Version1 = function(test) {
  var options = {
    path: '/test2',
    headers: {
      'accept-version': '1.0.0'
    }
  };

  client.get(options, function(err, req, res, data) {
    test.ifError(err);
    test.equal(res.statusCode, 200);
    test.equal(data, '1.0.0')
    test.done();
  });
}



