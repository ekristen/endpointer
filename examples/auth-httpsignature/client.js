var fs = require('fs');
var restify = require('restify');
var httpSignature = require('http-signature');

var data = '';

var client = restify.createStringClient({
  url: 'http://localhost:3000',
  signRequest: function (req) {
    if (req.method == 'POST') {
      var headers = ['request-line','host','date','content-type','content-md5','content-length'];
    }
    else {
      var headers = ['request-line','host','date'];
    }

    httpSignature.sign(req, {
        key: fs.readFileSync('key.pem', 'ascii'),
        keyId: '92d1b1d297110e6f918e774496bd5acbeb040286',
        headers: headers
    });
  }
});

client.get('/', function(err, req, res, obj) {
  console.log(obj);
  
  client.close();
});


