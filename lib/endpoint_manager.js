var path = require('path');
var fs = require('fs');
var restify = require('restify');

//var available_middleware = require('./middleware');

var EndpointManager = module.exports.EndpointManager = function(options) {
  if (typeof(options) !== "undefined") {
    this.options = options;
  } else {
    this.options = {};
    options = {};
  }

  this.endpoints = [];
  this.middleware = [];
  this.afterware = {};

  this.endpoint_modules = {};

  this.options.auth = options.auth || false;
  if (this.options.auth !== false && typeof(this.options.auth) !== 'function') {
    throw new Error('auth either must be false or a restify middleware function');
  }

  if (typeof(this.options.endpoint_args) == "undefined") {
    this.options.endpoint_args = [];
  }

  // Find all defined endpoints from the endpoint path
  if (options.endpointpath) {
    this.autodiscover(options.endpointpath, this.options.endpoint_args);
  }
};

// Perform basic validation and add endpoint to endpoints array,
// will be attached to the Restify Server later on.
EndpointManager.prototype.addEndpoint = function(endpoint) {
  if (!endpoint.name) {
    throw new Error('Name is required in an endpoint definition');
  }
  
  if (!endpoint.path) {
    throw new Error('Path is required in an endpoint definition');
  }
  
  if (!endpoint.method) {
    throw new Error('Method is required in an endpoint definition');
  }
  
  if (!endpoint.fn) {
    throw new Error('fn is required to define an endpoint');
  }

  // TODO: add other validation checks.

  // Add the endpoint to the endpoints
  this.endpoints.push(endpoint);
};

EndpointManager.prototype.processAfterware = function(server) {
  var self = this;

  server.on('after', function(req, res, route, err) {
    if (route == null) {
      return;
    }

    var afters = self.afterware[route.name] || [];

    afters.forEach(function (after) {
      after(req, res, route, err);
    });
  });
};

EndpointManager.prototype.addMiddleware = function(middleware) {
  var self = this;

  
};
 
EndpointManager.prototype.autodiscover = function(endpointpath, endpoint_args) {
  var self = this;

  // find all endpoints in `path`, similar to your `middleware/index.js` file
  var files = fs.readdirSync(endpointpath);

  // loop through endpoint files and load them.
  for (var i = 0; i < files.length; i++ ) {
    var extname  = path.extname(files[i]);
    var basename = path.basename(files[i], '.js');

    if (extname == '.js' && self.endpoint_modules[files[i]] !== true) {
      try {
        self.endpoint_modules[basename] = require(endpointpath + '/' + files[i]).apply(null, endpoint_args)
      }
      catch (e) {
        if (e.message == "Object #<Object> has no method 'apply'") {
          self.endpoint_modules[basename] = require(endpointpath + '/' + files[i])
        }
        else {
          throw e;
        }
      }
    }
  }

  // iterate through endpoint files
  Object.keys(self.endpoint_modules).forEach(function (c) {
    if (typeof(self.endpoint_modules[c]) != 'undefined') {
      if (typeof(self.endpoint_modules[c].endpoints) != 'undefined') {
        var endpoints = self.endpoint_modules[c].endpoints || [];
        // Add new endpoints to the list (keeping the list flat).
        endpoints.forEach(function(endpoint) {
          self.addEndpoint(endpoint);
        }.bind(self));
      }
    }
    else {
      console.warn('Invalid Endpoints File: ' + c);
    }
  });
};

// Attach to the Restify Server
EndpointManager.prototype.attach = function (server) {
  this.createRoutes(server);
};

// Loop through all defined endpoints, add them to the Restify Server
EndpointManager.prototype.createRoutes = function(server) {
  var self = this;

  // Here we add each endpoint as a route to the server.
  var allowed_methods = { 'GET' : true, 'POST' : true, 'PUT' : true, 'DEL' : true, 'HEAD': true };

  this.endpoints.forEach(function(endpoint) {

    // Create a list of methods for this endpoint.
    var methods = endpoint.method;
    if (methods.constructor.name !== 'Array') {
      methods = [ methods ];
    }

    // Add a route handler for each method.
    methods.forEach(function(method) {
      // Check if the method is allowed.
      if (allowed_methods[method] !== true) {
        // throw an error/show a warning...
        return;
      }
 
      var paths = endpoint.path;
      if (paths.constructor.name !== 'Array') {
        paths = [ paths ];
      }
 
      paths.forEach(function(path) {
        // Create a handler.
        var versions = [];
        versions = endpoint.version || '*';
        if (versions.constructor.name !== 'Array') {
          versions = [ versions ];
        }

        versions.forEach(function(version) {
          // Create a middleware chain.
          var middleware = [];

          if (typeof(self.options.auth) == 'function') {
            middleware.push(self.options.auth.bind(endpoint));
          }
 
          // If we require input validation for this endpoint,
          // add a validator middleware to the chain.
          if (endpoint.params) {
            middleware.push(self.validator(endpoint));
          }

          var middles = endpoint.middleware || [];
          if (middles.constructor.name !== 'Array') {
            middles = [ middles ];
          }

          // Attach all our middleware
          for (var x=0; x<middles.length; x++) {
            middleware.push(middles[x].bind(endpoint));
          }

          if (typeof(endpoint[version]) == "function") {
            middleware.push(endpoint[version].bind(endpoint));
          } else {
            middleware.push(endpoint.fn.bind(endpoint));
          }

          var afters = endpoint.afterware || [];
          if (afters.constructor.name !== 'Array') {
            afters = [ afters ];
          }

          if (version == '*') {
            var route = server[method.toLowerCase()]({
              path: path
            }, middleware);
          } else {
            var route = server[method.toLowerCase()]({
              path: path,
              version: version
            }, middleware);
          }

          self.afterware[route] = [];
          for (var x=0; x<afters.length; x++) {
            self.afterware[route].push(afters[x].bind(endpoint));
          }          
          
        });
      })
    });
  });

  this.processAfterware(server);
};


// Validate parameters, based on the endpoint.params definition
EndpointManager.prototype.validator = function(endpoint) {
  return function(req, res, next) {
    // Check params against incoming data.
    Object.keys(endpoint.params).forEach(function(index) {
      var param = endpoint.params[index];
      var value = req.params[param.name];

      // TODO -- use validator npm module to validate parameters ...
      // Check `required` state.
      if (param.required === true && value === undefined) {
        return next(new restify.InvalidArgumentError(param.name, 'Required parameter not present'));
      }
      else if (param.type === 'numeric' && typeof(param.value) !== 'numeric') {
        return next(new restify.InvalidArgumentError(param.name, 'Invalid value given for parameter'));
      }
    });
 
    // Done.
    return next();
  };
};
