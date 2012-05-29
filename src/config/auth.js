module.exports = function(everyauth, app) {
	var user = require('../models/user.js');

	everyauth.facebook
		.appId(config.fb_id)
		.appSecret(config.fb_secret)
		.scope('publish_actions')
		.findOrCreateUser(function (session, accessToken, accessTokenExtra, profile) {
			var promise = this.Promise();
			user.findOrCreateByUidAndNetwork(profile, promise, function(){});
			return promise;
		})
		.moduleErrback(function(err){
			console.log('Error logging in');
		})
		.redirectPath('/');

	everyauth.everymodule.findUserById(function(id, callback) {
		user.fetchUserById(id, function (err, usr) {
			if (err) return callback(err);
			callback(null, usr);
		});
	});

	everyauth.everymodule.logoutPath('/logout');

	everyauth.everymodule.logoutRedirectPath('/');

	everyauth.everymodule.handleLogout( function (req, res) {
		res.clearCookie('connect.sid');
    	req.session.destroy(function() {});
    	res.redirect('/');
	});
}