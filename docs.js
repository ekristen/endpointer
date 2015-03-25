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
  var value = {};

  value.name = endpoint.name;
  value.version = endpoint.version;

  value.group = endpoint.group
  value.groupTitle = endpoint.group

  //value.permission = parsePermission(source);

  value.title = endpoint.title || endpoint.name
  value.description = endpoint.description;
  value.type = (endpoint.method || 'GET').toUpperCase();
  value.url = endpoint.path || source.path;

  //value.parameter = parseParams(source.params);
  //value.success = parseFields(source.success, 'Success ');
  //value.error = parseFields(source.error, 'Error ');

  //value.examples = parseExamples(source.examples || {});

  return value;
}

function parseApiOld(api, results) {
  results || (results = []);

  var context = { version: api.version };

  //
  // endpoints organized by group
  //
  var name, endpoints;
  for (var groupName in api.groups) {
    context.groupName = groupName;
    var group = context.group = api.groups[groupName] || {};

    // clear any context values that may have been written
    context.path = '';
    context.type = '';

    endpoints = group.endpoints || {};
    for (name in endpoints) {
      context.name = name;
      results.push(parseEndpoint(endpoints[name], context));
    }
  }

  //
  // parse previous api data if present
  //
  if (api.previous) {
    parseApi(api.previous, results);
  }

  return results;
}

function parseApi(endpoints) {
  var results = []
  endpoints.forEach(function(endpoint) {
    results.push(parseEndpoint(endpoint))
  })
  return results
}

function parseProfileOld(config) {
  //
  // conservatively remap properties manually for apidocjs config
  //
  var api = config.api || {};
  var profile = xtend({}, api, config);

  profile.name || (profile.name = '');
  profile.title = config.doc.title || profile.title || profile.name;

  var basePath = (config.prefix || '') + (api.prefix || '');
  profile.url = (config.doc.url || '') + basePath;

  profile.header = config.doc.header;
  profile.footer = config.doc.footer;
  profile.template = {
    withCompare: !!api.previous,
    withGenerator: false
  };

  return profile;
}

function parseProfile() {
  var profile = {
    description: "\n    REST API for interacting with nsintel data, et cetera...\n    Moar text as <strong>arbitrary</strong> html...\n  ",
    footer: {
      content: "\n      <h1>Custom Footer</h1>\n      <p>This is an arbitrary <code>HTML</code> fragment</p>\n    ",
      title: "Custom Footer Title"
    },
    name: "NowSecure Mobile Intelligence API",
    template: {
      withCompare: true,
      withGenerator: false
    },
    title: "NowSecure Mobile Intelligence API",
    url: "https://api.nowsecure.com/nsintel",
    version: "0.3.0"
  }
  
  return profile
}


module.exports = function(endpointer) {
  
  var endpoints = {
    name: 'Docs',
    description: 'Documentation Endpoints',
    endpoints: [
      {
        name: 'getDocs',
        path: '/docs/.*',
        method: 'GET',
        handler: function(req, res) {
          var assets = ecstatic({
            root: path.join(__dirname, 'assets', 'template'),
            baseDir: '/docs',
            cache: 0
          })
          
          assets(req, res)
        }
      },
      {
        name: 'getDocsProject',
        path: '/api_project.js',
        method: 'GET',
        handler: function(req, res) {
          res.write('define(' + JSON.stringify(parseProfile()) + ')')
          res.end()
        }
      },
      {
        name: 'getDocsData',
        path: '/api_data.js',
        method: 'GET',
        handler: function(req, res) {
          res.write('define(' + JSON.stringify({ api: parseApi(endpointer.endpoints) }) + ')')
          res.end()
        }
      }
    ]
  }

  return endpoints;
}
