module.exports = function(everyauth, app) {
	var user = require('../models/user.js');

	everyauth.facebook
		.appId('359665827407633')
		.appSecret('0576adf85837ce83b97f509d34f574f2')
		.scope('publish_actions')
		.findOrCreateUser(function (session, accessToken, accessTokenExtra, fbUserMetadata) {
				var promise = this.Promise();
				user.findOrCreateByUidAndNetwork(fbUserMetadata.id, 'facebook', fbUserMetadata, promise);
				return promise;
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