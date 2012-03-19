var User = function() {

	var mongoose = require('mongoose');
	var Schema = mongoose.Schema;

	var UserSchema = new Schema({
		uid: {'type': String, 'required': true},   
		username: {'type': String, 'required': true},   
		network: {'type': String, 'required': false},
		bookmarks: {'type': [BookmarkSchema], 'required': false}
	});

	var BookmarkSchema = new Schema({
		address: {'type': String, 'required': true},
		imgAddress: {'type': String, 'required': false},
		tags: {'type': [String], 'required': false}
	});

	var model = mongoose.model('User', UserSchema);

	return {
		addBookmark: function(username, bkmrk, callback) {
			this.findUserByUsername(username, function(err, usr){
				usr._doc.bookmarks.push(bkmrk);
				usr.markModified('bookmarks');
				usr.save(function(err){
					callback(err);
				});
			});
		},

		findUserByUsername: function(username, callback) {
			model.findOne({'username': username}, function(err, usr) {
				callback(err, usr);
			});
		},

		fetchUserById: function(id, callback) {
			model.findOne({_id: id}, function(err, usr){
				callback(err, usr);
			});
		},

		getBookmarks: function(username, filter, callback) {
			this.findUserByUsername(username, function(err, usr){
				var bkmrks;
				if(usr) {
					bkmrks = new Array();
					usr._doc.bookmarks.forEach(function(bkmrk) {
						if(filter(bkmrk)) {
							bkmrks.push(bkmrk);
						}
					});
				}
				callback(bkmrks);
			});
		},

		findOrCreateByUidAndNetwork: function(uid, network, profile, promise, callback) {
			model.findOne({uid: uid, network: network}, function(err, usr){
				if(err) throw err;
				if(usr) {
					promise.fulfill(usr);
				} else {
					var newUsr = new model();
					newUsr.network = network;
					newUsr.uid = uid;
					newUsr.username = profile.username;
					newUsr.bookmarks = new Array();
					newUsr.save(function(err){
						if (err) throw err;
						promise.fulfill(newUsr);
					});
				}
				callback();
			});
		},

		removeUser: function(username, callback) {
			this.findUserByUsername(username, function(err, usr) {
				if(err) throw err;
				usr.remove();
				callback();
			})
		}
	};

}();
module.exports = User;