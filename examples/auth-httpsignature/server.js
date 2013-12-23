var restify = require('restify');
var endpoints = require('../../lib');

// Setup Restify Endpoints Manager
var endpoints = new endpoints.EndpointManager();

// Create the RESTful Server
var server = restify.createServer();

server.use(restify.acceptParser(server.acceptable));
server.use(restify.authorizationParser());
server.use(restify.dateParser());
server.use(restify.queryParser());
server.use(restify.jsonp());
server.use(restify.gzipResponse());
server.use(restify.bodyParser());
server.use(restify.conditionalRequest());

// Add a single endpoint with authentication required
// default authentication method is httpSignature
endpoints.addEndpoint({
  name: 'Example Auth Endpoint',
  description: 'Default Auth Example Endpoint',
  method: 'GET',
  auth: true,
  path: '/',
  version: '1.0.0',
  fn: function (req, res, next) {
    res.send({"status": "ok", "message": "Auth Example Default Endpoint", "data": "Congratulations, authentication successful"});
    return next();
  }
});

// Attach Restify Endpoints to RESTify server
endpoints.attach(server);

// Start the restify server
server.listen(3000, function() {
  console.log('restify-endpoints example: auth-httpsignature');
});