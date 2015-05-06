var Endpointer = require('./endpointer.js');

Endpointer.prototype.attachRoute = function(server, endpoint, middleware) {
  var self = this;
  var route;

  var afters = endpoint.afterware || [];
  if (afters.constructor.name !== 'Array') {
    afters = [ afters ];
  }

  if (endpoint.version == '*') {
    route = server[endpoint.method.toLowerCase()]({
      path: endpoint.path
    }, middleware);
  } else {
    route = server[endpoint.method.toLowerCase()]({
      path: endpoint.path,
      version: endpoint.version
    }, middleware);
  }
  
  self.afterware[route] = [];
  for (var x=0; x<afters.length; x++) {
    self.afterware[route].push(afters[x].bind(endpoint));
  }

};

module.exports = Endpointer;
