var path = require('path');
var xtend = require('xtend');
var ecstatic = require('ecstatic');

function parsePermission(endpoint) {
  var annotations = endpoint.handler && endpoint.handler.annotations || {};
  return annotations.permission ? [ annotations.permission ] : []
}

function parseExamples(examples) {
  var results = [];
  for (var title in examples) {
    var example = examples[title];
    results.push({
      title: title,
      type: example.syntax || 'string',
      content: typeof example === 'string' ? example : example.content
    });
  }
  return results;
}

function parseFieldGroup(fields, group) {
  var results = [];

  for (var key in fields) {
    var field = fields[key];
    var result = {
      group: group,
      type: field.type,
      field: key,
      optional: field.required === false,
      description: field.description || ''
    };
    results.push(result);
  }

  return results;
}

function parseFields(fields, prefix) {
  fields || (fields = {});
  var value = { fields: {} };

  for (var name in fields) {
    var group = prefix + name;
    value.fields[group] = parseFieldGroup(fields[name], group);
  }

  return value;
}

function parseParams(params) {
  var result = parseFields({ '': params }, 'Parameter');
  var fields = result.fields && result.fields.Parameter || [];
  return fields.length ? result : {};
}

function parseEndpoint(endpoint) {
  var value = {}

  value.name = endpoint.name
  value.version = endpoint.version

  value.group = endpoint.group
  value.groupTitle = endpoint.group

  value.title = endpoint.title || endpoint.name
  value.description = endpoint.description;
  value.type = (endpoint.method || 'GET').toUpperCase();
  value.url = endpoint.path || source.path;

  value.parameter = parseParams(endpoint.params || {});

  // TODO -- need to allow for these soon!
  //value.permission = parsePermission(source);
  //value.success = parseFields(source.success, 'Success ');
  //value.error = parseFields(source.error, 'Error ');
  //value.examples = parseExamples(source.examples || {});

  return value;
}

function parseApiEndpoints(endpoints) {
  var results = []
  endpoints.forEach(function(endpoint) {
    if (endpoint.group.toLowerCase() == 'docs') return
    results.push(parseEndpoint(endpoint))
  })
  return results
}


function parseProfile(config) {
  var profile = {}

  profile.title = config.docs.title || config.title
  profile.name = profile.title

  profile.url = config.url

  profile.header = config.docs.header || { content: '' }
  profile.footer = config.docs.footer || { content: '' }

  profile.template = {
    withCompare: config.docs.withCompare || true,
    wighGenerator: false
  }

  profile.version = config.version || '0.0.0'

  return profile
}


module.exports = function(endpointer) {
  
  var prefix = endpointer.options.docs.prefix || '/docs'
  
  var endpoints = {
    name: 'Docs',
    description: 'Documentation Endpoints',
    endpoints: [
      {
        name: 'getDocsProject',
        path: prefix + '/api_project.js',
        method: 'GET',
        handler: function(req, res) {
          res.write('define(' + JSON.stringify(parseProfile(endpointer.options)) + ')')
          res.end()
        }
      },
      {
        name: 'getDocsData',
        path: prefix + '/api_data.js',
        method: 'GET',
        handler: function(req, res) {
          res.write('define(' + JSON.stringify({ api: parseApiEndpoints(endpointer.endpoints) }) + ')')
          res.end()
        }
      },
      {
        name: 'getDocs',
        path: prefix + '/.*',
        method: 'GET',
        handler: function(req, res) {
          var assets = ecstatic({
            root: path.join(__dirname, 'assets', 'template'),
            baseDir: '/docs',
            cache: 0
          })

          assets(req, res)
        }
      }
    ]
  }

  return endpoints;
}
