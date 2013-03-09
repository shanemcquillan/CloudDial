module.exports = function(passport, app) {
	var user = require('../models/user.js')
	, LocalStrategy = require('passport-local').Strategy
	, SALT_WORK_FACTOR = 10;

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
  		user.fetchUserById(id, function (err, user) {
   			done(err, user);
  		});
	});

	passport.use(new LocalStrategy(function(username, password, done) {
		user.findUserByUsername(username, function(err, user) {
			if (err) { 
				return done(err); 
			}
			if (!user) { 
				return done(null, false, { message: 'Unknown user ' + username }); 
			}
			user.comparePassword(password, function(err, isMatch) {
				if (err)
					return done(err);
			  	if(isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { message: 'Invalid password' });
			  	}
			});
		});
	}));

	// function ensureAuthenticated(req, res, next) {
	//     if (req.isAuthenticated()) { 
	// 	    return next(); 
	//     }
	//     res.redirect('/')
	// }

	// everyauth.facebook
	// 	.appId(config.fb_id)
	// 	.appSecret(config.fb_secret)
	// 	.scope('publish_actions')
	// 	.findOrCreateUser(function (session, accessToken, accessTokenExtra, profile) {
	// 		var promise = this.Promise();
	// 		user.findOrCreateByUidAndNetwork(profile, promise, function(){});
	// 		return promise;
	// 	})
	// 	.moduleErrback(function(err){
	// 		console.log('Error logging in');
	// 	})
	// 	.redirectPath('/');

	// everyauth.everymodule.findUserById(function(id, callback) {
	// 	user.fetchUserById(id, function (err, usr) {
	// 		if (err) return callback(err);
	// 		callback(null, usr);
	// 	});
	// });

	// everyauth.everymodule.logoutPath('/logout');

	// everyauth.everymodule.logoutRedirectPath('/');

	// everyauth.everymodule.handleLogout( function (req, res) {
	// 	res.clearCookie('connect.sid');
 //    	req.session.destroy(function() {});
 //    	res.redirect('/');
	// });
}