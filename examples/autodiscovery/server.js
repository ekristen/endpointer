var restify = require('restify');
var endpoints = require('../../lib');

var endpoints = new endpoints.EndpointManager({
	endpointpath: __dirname + '/endpoints'
});

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

// Attach Restify Endpoints to RESTify server
endpoints.attach(server);

server.listen(3000);