var fs = require('fs')
var path = require('path')
var xtend = require('xtend')
var debug = require('debug')('endpoints')

//var docs = require('./docs.js')

var Endpointer = function(options) {
  var self = this
  
  self.options = xtend({
    title: 'Endpointer',
    url: 'http://localhost:3000',
    docs: {
      enabled: false,
      prefix: '/docs',
    },
    arguments: [],
    endpoints: './endpoints'
  }, options)

  self.endpoints = []
  self.middleware = []
  self.afterware = {}

  self.endpoint_modules = {}

  // Find all defined endpoints from the endpoint path
  if (self.options.endpoints) {
    self.autodiscover(self.options.endpoints, self.options.arguments)
  }

  if (self.options.docs.enabled == true) {
    var docs = require('./docs.js')(self)
    docs.endpoints.forEach(function(endpoint) {
      endpoint.group = docs.name
      endpoint.groupTitle = docs.name
      self.addEndpoint(endpoint)
    })
  }
};

// Perform basic validation and add endpoint to endpoints array,
// will be attached to the Restify Server later on.
Endpointer.prototype.addEndpoint = function(endpoint) {
  if (!endpoint.name)
    throw new Error('Name is required in an endpoint definition')
  
  if (!endpoint.path)
    throw new Error('Path is required in an endpoint definition')
  
  if (!endpoint.method)
    throw new Error('Method is required in an endpoint definition')
  
  endpoint.handler = endpoint.handler || endpoint.fn || null
  if (!endpoint.handler)
    throw new Error('fn is required to define an endpoint')
  
  // Add the endpoint to the endpoints
  this.endpoints.push(endpoint);
};

Endpointer.prototype.getEndpoints = function() {
  return this.endpoints;
}

Endpointer.prototype.processAfterware = function(server) {
  var self = this

  server.on('after', function(req, res, route, err) {
    if (route == null) return

    var afters = self.afterware[route.name] || []

    afters.forEach(function (after) {
      after(req, res, route, err)
    })
  })
}
 
Endpointer.prototype.autodiscover = function(discover_path, discover_args) {
  var self = this

  // find all endpoints in `path`, similar to your `middleware/index.js` file
  var files = fs.readdirSync(discover_path)

  // loop through endpoint files and load them.
  for (var i = 0; i < files.length; i++ ) {
    var extname  = path.extname(files[i])
    var basename = path.basename(files[i], '.js')

    if (extname == '.js' && self.endpoint_modules[files[i]] !== true) {
      try {
        self.endpoint_modules[basename] = require(discover_path + '/' + files[i]).apply(null, discover_args)
      }
      catch (e) {
        if (e.message == "Object #<Object> has no method 'apply'") {
          self.endpoint_modules[basename] = require(discover_path + '/' + files[i])
        }
        else {
          throw e
        }
      }
    }
  }

  // iterate through endpoint files
  Object.keys(self.endpoint_modules).forEach(function (c) {
    if (typeof(self.endpoint_modules[c]) != 'undefined') {
      if (typeof(self.endpoint_modules[c].endpoints) != 'undefined') {
        var group = self.endpoint_modules[c]
        var endpoints = group.endpoints || []
        // Add new endpoints to the list (keeping the list flat).
        endpoints.forEach(function(endpoint) {
          endpoint.group = group.name
          endpoint.groupTitle = group.name
          self.addEndpoint(endpoint)
        }.bind(self))
      }
    }
    else {
      console.warn('Invalid Endpoints File: ' + c)
    }
  });
};

// Attach to the Restify Server
Endpointer.prototype.attach = function (server) {
  this.createRoutes(server);
};

// Loop through all defined endpoints, add them to the Restify Server
Endpointer.prototype.createRoutes = function(server) {
  var self = this

  // Here we add each endpoint as a route to the server.
  var allowed_methods = { 'GET' : true, 'POST' : true, 'PUT' : true, 'DEL' : true, 'HEAD': true }

  this.endpoints.forEach(function(endpoint) {
    // Create a list of methods for this endpoint.
    var methods = endpoint.method
    if (methods.constructor.name !== 'Array')
      methods = [ methods ]

    // Add a route handler for each method.
    methods.forEach(function(method) {
      // Check if the method is allowed.
      if (allowed_methods[method] !== true) {
        // throw an error/show a warning...
        return;
      }
 
      var paths = endpoint.path
      if (paths.constructor.name !== 'Array')
        paths = [ paths ]
 
      paths.forEach(function(path) {
        // Create a handler.
        var versions = []
        versions = endpoint.version || '*'
        if (versions.constructor.name !== 'Array')
          versions = [ versions ]

        versions.forEach(function(version) {
          // Create a middleware chain.
          var middleware = []
 
          var middles = endpoint.middleware || []
          if (middles.constructor.name !== 'Array')
            middles = [ middles ]

          // Attach all our middleware
          for (var x=0; x<middles.length; x++) {
            middleware.push(middles[x].bind(endpoint))
          }

          if (typeof(endpoint[version]) == "function") {
            middleware.push(endpoint[version].bind(endpoint))
          } else {
            middleware.push(endpoint.handler.bind(endpoint))
          }

          self.attachRoute(server, endpoint, middleware)
        })
      })
    })
  })

  this.processAfterware(server)
};


Endpointer.prototype.attachRoute = function (server, endpoint, middleware) {
  // placeholder
}

module.exports = Endpointer
