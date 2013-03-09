var user = require('../models/user.js');
//var passport = require('passport');

module.exports = function(req, res, next) {
  	passport.authenticate('local', function(err, user, info) {
    	if (err) { return next(err) }
    	if (!user) {
      		req.session.messages =  [info.message];
      		return res.redirect('/login')
    	}
    	req.logIn(user, function(err) {
      		if (err) { return next(err); }
      		res.writeHead(200, { "Content-Type": "application/json" });
      		return res.end();
    	});
    })(req, res, next);
}