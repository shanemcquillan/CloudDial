module.exports = function(everyauth, app) {
	var user = require('../models/user.js');

	everyauth.facebook
		.appId(config.fb_id)
		.appSecret(config.fb_secret)
		.scope('publish_actions')
		.findOrCreateUser(function (session, accessToken, accessTokenExtra, fbUserMetadata) {
			var promise = this.Promise();
			user.findOrCreateByUidAndNetwork(fbUserMetadata.id, 'facebook', fbUserMetadata, promise, function(){});
			return promise;
		})
		.moduleErrback(function(err){
			console.log('Error logging in');
		})
		.redirectPath('/');

	everyauth.everymodule
		.findUserById(function(id, callback) {
			user.fetchUserById(id, function (err, usr) {
				if (err) return callback(err);
				callback(null, usr);
			});
		});
}