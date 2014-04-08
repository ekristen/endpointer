// Structured this way for room to expand and support
// additional classes and options later on.

module.exports.EndpointManager = require('./endpoint_manager').EndpointManager;

/**
TODO: redo how middleware works
module.exports.middleware = {};
var middleware = require('./middleware');
Object.keys(middleware).forEach(function (k) {
  module.exports.middleware[k] = middleware[k];
  module.exports[k] = middleware[k];
});
*/