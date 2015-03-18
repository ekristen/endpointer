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
