var fs = require('fs');
var restify = require('restify');
var httpSignature = require('http-signature');

// Define the Restify JSON Client
// You could easily use an http request client as well.
var client = restify.createJsonClient({
  url: 'http://localhost:3000',
  signRequest: function (req) {
    
    // The default headers for http signature is date
    // Using more headers especially content-md5, content-length helps prevent against reply attacks
    if (req.method == 'POST') {
      var headers = ['request-line','host','date','content-type','content-md5','content-length'];
    }
    else {
      var headers = ['request-line','host','date'];
    }

    // Sign the request with http-signature library
    httpSignature.sign(req, {
        key: fs.readFileSync('key.pem', 'ascii'),
        keyId: '92d1b1d297110e6f918e774496bd5acbeb040286',
        headers: headers
    });
  }
});

// Perform a GET request against the API server defined in server.js
client.get('/', function(err, req, res, obj) {
  console.log(obj);
  
  client.close();
});