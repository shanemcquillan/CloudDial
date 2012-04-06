var User = function() {

	var mongoose = require('mongoose');
	var Schema = mongoose.Schema;

	var UserSchema = new Schema({
		uid: {'type': String, 'required': true},   
		username: {'type': String, 'required': true},   
		network: {'type': String, 'required': false},
		groups: {'type': [GroupSchema], 'required': false}
	});

	var GroupSchema = new Schema({
		name: {'type': String, 'required': true},
		bookmarks: {'type': [BookmarkSchema], 'required': false},
		// subgroups: {'type': [SubgroupSchema], 'required': false},
		private: {'type': Boolean, 'required': false},
		default: {'type': Boolean, 'required': false}
	});

	// var SubgroupSchema = new Schema({
	// 	name: {'type': String, 'required': true},
	// 	bookmarks: {'type': [BookmarkSchema], 'required': false},
	// 	subgroups: {'type': [SubgroupSchema], 'required': false},
	// 	private: {'type': Boolean, 'required': false}
	// });

	var BookmarkSchema = new Schema({
		address: {'type': String, 'required': true},
		imgAddress: {'type': String, 'required': false},
		tags: {'type': [String], 'required': false},
		private: {'type': Boolean, 'required': false}
	});

	var model = mongoose.model('User', UserSchema);

	return {
		addBookmark: function(username, group, bkmrk, callback) {
			this.findUserByUsername(username, function(err, usr){
				for(var i = 0; i < usr._doc.groups.length; i++) {
					if(usr._doc.groups[i].name === group) {
						usr._doc.groups[i].bookmarks.push(bkmrk);
						break;
					}
				}
				usr.markModified('groups');
				usr.save(function(err){
					callback(err);
				});
			});
		},

		addGroup: function(username, groupName, callback) {
			this.findUserByUsername(username, function(err, usr){
				var group = {name: groupName, bookmarks: []};
				usr._doc.groups.push(group);
				usr.markModified('groups');
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
				var groups;
				if(usr) {
					groups = new Array();
					usr._doc.groups.forEach(function(grp) {
						if(filter(grp)) {
							groups.push(grp);
						}
					});
				}
				callback(groups);
			});
		},

		getGroup: function(username, group, callback) {
			this.findUserByUsername(username, function(err, usr){
				for(var i = 0; i < usr._doc.groups.length; i++) {
					if(usr._doc.groups[i].name === group) {
						callback(err, usr._doc.groups[i]);
						break;
					}
				}
			});
		},

		getGroupNames: function(username, callback) {
			this.findUserByUsername(username, function(err, usr){
				var groupNames = new Array();
				for(var i = 0; i < usr._doc.groups.length; i++) {
					groupNames.push(usr._doc.groups[i].name);
				}
				callback(groupNames);	
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
					newUsr.groups = [{name: 'home', bookmarks: [], default: true}];	//Default group
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