var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	uid: String,    
	username: String,   
	network: String,
	bookmarks: {}
});

mongoose.model('User', UserSchema);

var User = exports.User = mongoose.model('User');

exports.findOrCreateByUidAndNetwork = function(uid, network, profile, promise) {
	User.findOne({uid: uid, network: network}, function(err, user){
		if(err) throw err;
		if(user) {
			promise.fulfill(user);
		} else {
			var newUser = new User();
			newUser.network = network;
			newUser.uid = uid;
			newUser.username = profile.username;
			newUser.bookmarks = {};
			newUser.save(function(err){
				if (err) throw err;
				promise.fulfill(newUser);
			});
		}
	});
};

exports.fetchUserById = function(id, callback) {
	User.findOne({_id: id}, function(err, user){
		callback(err, user);
	});
}