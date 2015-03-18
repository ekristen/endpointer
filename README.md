# Overview

This is a complete rewrite of the original restify-endpoints project. This will support full auto-documentation as well as being able to be attached to restify, express, or a vanilla http service with a router attached.


## Server Examples

### Restify

```javascript
var restify = require('restify')
var Endpointer = require('./restify.js')

var endpoints = new Endpointer()

endpoints.addEndpoint({
  name: 'test',
  description: 'test',
  method: 'GET',
  path: '/test',
  version: '1.0.0',
  handler: function(req, res, next) {
    console.log('test handler called')
    res.send('hi')
    return next()
  }
})

var server = restify.createServer({
  name: 'endpointer',
  version: '1.0.0'
});

endpoints.attach(server)

server.listen(8000)
```

### Express

```javascript
var express = require('express')
var endpoints = new endpoints.EndpointManager()

endpoints.attach(express)
express.listen(8000)
```

### Vanilla HTTP

With vanilla node HTTP you'll need a router attached.

```javascript
var http = require('http')
var router = require('router')()
var endpoints = new endpoints.EndpointManager()

function finalHandler(req, res) { }

var server = http.createServer(function(req, res) {
  router(req, res, finalHandler(req, res))
})

endpoints.attach(server)

server.listen(8000)
```


## Additional Information

### Afterware

This is only supported on `restify` unless you add a `server.on('after')` handler for `express` or the vanilla http server. You'd need to emit the `after` event AFTER the response has already been sent.

