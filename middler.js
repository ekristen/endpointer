var Endpointer = require('./endpointer.js');

Endpointer.prototype.attachRoute = function(server, endpoint, middleware) {
  var self = this;

  server[endpoint.method.toLowerCase()](endpoint.path, middleware);
};

module.exports = Endpointer;
