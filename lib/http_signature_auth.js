var config = require('config');
var restify = require('restify');
var httpSignature = require('http-signature');
var winston = require('winston');
var sqlite3 = require('sqlite3');

var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({colorize: true, timestamp: true})
	],
});

function authenticateUser(options) {
	function authUser(req, res, next) {
		var db = new sqlite3.Database(config.database)

		// Do not require authentication on root
		if (req.url == '/') return next();

		if (typeof(options.exemptions) != 'undefined') {
			for (var i=0; i<options.exemptions.length; i++) {
				if (options.exemptions[i] == req.url) {
					logger.warn("authentication exemption for " + req.url + " from IP: " + req.connection.remoteAddress);
					req.user = 'anonymous';
					return next();
				}
			}
		}

		// Figure out if there are any other exceptions to not authenticate
		for (var i in config.api.auth_exceptions) {
			if (req.url == config.api.auth_exceptions[i]) {
				logger.warn("authentication exemption for " + req.url + " from IP: " + req.connection.remoteAddress);
				req.user = 'anonymous';
				return next();
			}
		}

    // Get a single entry
    var stmt = db.prepare("SELECT publicKey FROM keys WHERE keyId = '?'", req.username);
		db.get(stmt, function(err, result) {
			if (err) {
				logger.log('error', 'MySQL Error:', err);
				return next(err);
			}

			if (typeof(result) != 'undefined') {
				if (httpSignature.verifySignature(req.authorization.signature, result.publicKey)) {
					logger.log('info', 'Sucessfully authenticated user');
					req.user = req.username;
					db.close();
					return next();
				}
				else {
					db.close();
					logger.log('debug', 'Unable to validate signature');
					return next(new restify.NotAuthorizedError('Unable to validate signature'));
				}
			}
			else {
				db.close();
				logger.log('debug', 'Unable to authenticate user');
				return next(new restify.NotAuthorizedError('Unable to authenticate the user'));
			}
		});
	}

	return (authUser);
}

exports = module.exports = authenticateUser;