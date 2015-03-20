var url = require('url')
var paramify = require('paramify');
var docs = require('./docs');

function addRoute(endpoint, routes) {
  // normalize method name
  endpoint.method = (endpoint.method || 'GET').toUpperCase();
  routes[endpoint.path] = endpoint;
}

function parseRoutes(api) {
  var routes = {};

  // endpoints organized by group
  if (Array.isArray(api.endpoints)) {
    api.endpoints.forEach(function (group) {
      for (var name in group.endpoints) {
        addRoute(group.endpoints[name], routes);
      }
    });
  }

  // top level (ungrouped) endpoints
  else {
    for (var name in api.endpoints) {
      addRoute(api.endpoints[name], routes);
    }
  }

  return routes;
}

module.exports = function (api, config) {
  api || (api = {});
  config || (config = {});

  api.prefix || (api.prefix = '');
  config.prefix || (config.prefix = '');

  var basePath = config.prefix + api.prefix;
  var routes = parseRoutes(api, basePath);

  var app = { requests: [] };

  if (config.doc && config.doc.prefix) {
    app.requests.push(docs(api, config));
  }

  app.requests.push({

    test: function (req, res) {
      return req.url.indexOf(basePath) === 0;
    },

    handler: function (req, res) {
      // strip base path prefix from request url
      req.url = req.url.substring(basePath.length);

      var match = paramify(url.parse(req.url).pathname);

      // iterate available routes
      for (var route in routes) {
        var endpoint = routes[route];
        // match route by method and path info
        if (req.method == endpoint.method && match(route)) {
          return endpoint.handler(req, res);
        }
      }

      res.statusCode = 501;
      res.end('Not Implemented');
    }

  });

  return app;
}
