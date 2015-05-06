var restify = require('restify');
var manager = require('../lib');

var SERVER;
var STR_CLIENT;
var ENDPOINTS;

function testAfterware (req, res, route, err) {
  return next();
}

exports.setUp = function(done) {  
  ENDPOINTS = new manager.EndpointManager();

  SERVER = restify.createServer({
    name: 'myapp',
    version: '1.0.0'
  });
  SERVER.use(restify.acceptParser(SERVER.acceptable));
  SERVER.use(restify.queryParser());
  SERVER.use(restify.bodyParser({
    mapParams: false,
    overrideParams: false
  }));

  ENDPOINTS.addEndpoint({
    name: 'test',
    description: 'test',
    method: 'GET',
    path: '/test',
    afterware: testAfterware,
    fn: function (req, res, next) {
      res.send(200);
      return next();
    }
  });

  ENDPOINTS.attach(SERVER);

  SERVER.listen(9999, '127.0.0.1', function() {
      STR_CLIENT = restify.createStringClient({
          url: 'http://127.0.0.1:9999',
          retry: false
      });

      done();
  });
};

exports.tearDown = function(done) {
  STR_CLIENT.close();
  SERVER.close(done);
};

exports.singleAfterware = function(test) {
  STR_CLIENT.get('/test', function(err, req, res, data) {
    test.ifError(err);
    test.ok(req);
    test.ok(res);
    test.done();
  });
};
