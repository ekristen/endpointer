var path = require('path')
var xtend = require('xtend')
var ecstatic = require('ecstatic')

function parsePermissions(permissions) {
  var map = {};
  for (var name in permissions) {
    map[name] = {
      name: name,
      title: permissions[name].title || name,
      description: permissions[name].description || '',
    };
  }
  return map;
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

function parseParams(fields) {
  var results = [];
  for (var key in fields) {
    var field = fields[key];
    results.push({
      group: 'Parameter',
      type: field.type,
      field: key,
      optional: !field.required,
      description: field.description
    });
  }
  return !results.length ? {} :  { fields: { Parameter: results } };
}

// TODO
function parseSuccessFields(fields) {
  return fields;
}

// TODO
function parseErrorFields(fields) {
  return fields;
}

function parseEndpoint(endpoint, context) {
  var result = {};

  result.name = context.name;
  result.version = context.version;
  result.group = context.group && context.group.name || '';
  result.groupTitle = context.group && context.group.title || result.group;

  result.permission = (endpoint.permissions || []).map(function (value) {
    return typeof value === 'string' ? context.permissions[value] : value
  }).filter(function (value) {
    return value
  });

  result.title = endpoint.title;
  result.description = endpoint.description;
  result.type = (endpoint.method || 'GET').toUpperCase();
  result.url = endpoint.path;

  result.examples = parseExamples(endpoint.examples || {});
  result.parameter = parseParams(endpoint.params || {});
  result.success = parseParams(endpoint.success || {});
  result.error = parseParams(endpoint.error || {});

  return result;
}

function parseEndpoints(endpoints, context, results) {
  for (var name in endpoints) {
    context.name = name;
    results.push(parseEndpoint(endpoints[name], context));
  }
}

function parseApi(api, results) {
  results || (results = []);
  var context = {
    version: api.version,
    permissions: parsePermissions(api.permissions || {})
  };

  if (Array.isArray(api.endpoints)) {
    // parse endpoints organized by groups
    api.endpoints.forEach(function (group) {
      context.group = group;
      parseEndpoints(group.endpoints, context, results);
    });
  }
  else {
    // parse naked top level endpoints
    parseEndpoints(api.endpoints, context, results);
  }

  // parse previous api data if present
  if (api.previous) {
    parseApi(api.previous, results);
  }

  return results;
}

function parseProfile(api, config) {
  // conservatively remap properties manually for apidocjs config
  var profile = xtend({}, api, config);

  profile.name || (profile.name = '');
  profile.title || (profile.title = profile.name || '');

  var basePath = (config.prefix || '') + (api.prefix || '');
  profile.url = (config.doc.url || '') + basePath;

  profile.header = config.doc && config.doc.header;
  profile.footer = config.doc && config.doc.footer;
  profile.template = {
    withCompare: !!api.previous,
    withGenerator: false
  };

  return profile;
}

module.exports = function (api, config) {
  var docPath = (config.prefix || '') + (config.doc.prefix || '');

  var API_DATA = 'define(' + JSON.stringify({ api: parseApi(api) }) + ')';
  var API_PROJECT = 'define(' + JSON.stringify(parseProfile(api, config)) + ')';

  // static asset server for map doc template
  var templateAssets = ecstatic({
    root: path.join(__dirname, 'assets/doc-template'),
    cache: 0
  });

  return {
    test: function (req, res) {
      return req.url.indexOf(docPath) === 0;
    },
    handler: function (req, res) {
      var url = req.url.substring(docPath.length);

      if (url.indexOf('/api_data.js') === 0) {
        res.statusCode = 200;
        res.end(API_DATA);
      }
      else if (url.indexOf('/api_project.js') === 0) {
        res.statusCode = 200;
        res.end(API_PROJECT);
      }
      else {
        req.url = url;
        templateAssets(req, res);
      }
    }
  }
}
