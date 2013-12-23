var restify = require('restify');
var httpSignature = require('http-signature');
var anydb = require('any-db');

function authenticateUser(endpoint, options) {
  
  opts = options || {};

  if (opts.driver == "sqlite3") {
    opts.dbstring = options.dbstring || "sqlite3://data//keys.db";
  }
  else if (options.driver == "mysql") {
    opts.dbstring = options.dbstring || "mysql://root:root@127.0.0.1:3306/restifyendpoints";
  }
  else if (options.driver == "postgres") {
    opts.dbstring = options.dbstring || "postgres://root:root@127.0.0.1/restifyendpoints";
  }

	function authUser(req, res, next) {
		var db = anydb.createConnection(options.dbstring);

    // Get a single entry
    var sql = "SELECT publicKey FROM keys WHERE keyId = ?";
    db.query(sql, req.username, function(err, result) {
			if (err) {
				return next(err);
			}

			if (result.rowCount === 1) {
				if (httpSignature.verifySignature(req.authorization.signature, result.rows[0].publicKey)) {
					//logger.log('info', 'Sucessfully authenticated user');
					req.user = req.username;
					db.end();
					return next();
				}
				else {
					db.end();
					//logger.log('debug', 'Unable to validate signature');
					return next(new restify.NotAuthorizedError('Unable to validate signature'));
				}
			}
			else {
        db.end();
				//logger.log('debug', 'Unable to authenticate user');
				return next(new restify.NotAuthorizedError('Unable to authenticate the user'));
			}
		});
	}

	return (authUser);
}

exports = module.exports = authenticateUser;