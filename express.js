var Endpointer = require('./endpointer.js');

Endpointer.prototype.attachRoute = function(server, endpoint, middleware) {
  var self = this;

  var handler = middleware.pop();

  var route = server[endpoint.method.toLowerCase()](
    endpoint.path,
    middleware,
    handler
  );

};

module.exports = Endpointer;
