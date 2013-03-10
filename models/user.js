var User = function() {

	var mongoose = require('mongoose');
	var Schema = mongoose.Schema;

	var UserSchema = new Schema({
		username: {'type': String, 'required': true, 'unique': true},
    	//email: { type: String, required: true, unique: true },
    	password: { type: String, required: true},
		groups: {'type': [GroupSchema], 'required': false}
	});

	var GroupSchema = new Schema({
		name: {'type': String, 'required': true},
		bookmarks: {'type': [BookmarkSchema], 'required': false},
		// subgroups: {'type': [SubgroupSchema], 'required': false},
		private: {'type': Boolean, 'required': false},
		isDefault: {'type': Boolean, 'required': false}
	});

	// var SubgroupSchema = new Schema({
	// 	name: {'type': String, 'required': true},
	// 	bookmarks: {'type': [BookmarkSchema], 'required': false},
	// 	subgroups: {'type': [SubgroupSchema], 'required': false},
	// 	private: {'type': Boolean, 'required': false}
	// });

	var BookmarkSchema = new Schema({
		title: {'type': String, 'required': true},
		address: {'type': String, 'required': true},
		imgAddress: {'type': String, 'required': false},
		tags: {'type': [String], 'required': false},
		description: {'type': String, 'required': false},
		private: {'type': Boolean, 'required': false}
	});

	UserSchema.methods.comparePassword = function(candidatePassword, callback) {
		if(candidatePassword === this.password) {
			callback(null, true)
		} else {
			return callback(null, false);
		}
	};

	var model = mongoose.model('User', UserSchema);

	return {	//Public functions
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

		addGroup: function(username, group, callback) {
			this.findUserByUsername(username, function(err, usr){
				group.bookmarks = [];
				var unique = true;
				for(var i = 0; i < usr._doc.groups.length; i++) {
					if(usr._doc.groups[i].name === group.name) {
						unique = false;
						break;
					}
				}
				if(unique) {
					usr._doc.groups.push(group);
					usr.markModified('groups');
					usr.save(function(err){
						callback(err);
					});
				}
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

		getPublicBookmarks: function(username, callback) {
			this.getBookmarks(
				username,
				function(grp) {
					var bkmrks = new Array();
					grp.bookmarks.forEach(function(bkmrk){
						if(!bkmrk.private) {
							bkmrks.push(bkmrk);
						}
					});
					grp.bookmarks = bkmrks;
					return !grp.private;	
				},
				callback
			);
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
				callback(null, groupNames);	
			});
		},

		getTagAmountsByGroup: function(username, callback) {
			this.findUserByUsername(username, function(err, usr){
				var tags = {};
				usr._doc.groups.forEach(function(grp){
					tags[grp.name] = {};
					grp.bookmarks.forEach(function(bkmrk){
						bkmrk.tags.forEach(function(tg){
						if(!tags[grp.name][tg]) {		//If tag is not added
								tags[grp.name][tg] = 1;
							} else {
								tags[grp.name][tg]++;
							}
						});
					});
				});
				callback(tags);	
			});
		},

		findOrCreateUser: function(user, callback) {
			model.findOne({username: user.username}, function(err, usr){
				if(err) throw err;
				if(!usr) {
					var newUsr = new model();
					newUsr.username = user.username;
					newUsr.password = user.password;
					newUsr.groups = [{name: 'home', bookmarks: [], isDefault: true, private: false}];	//Default group
					newUsr.save(function(err){
						if (err) throw err;
					});
				}
				callback();
			});
		},

		comparePassword: function(candidatePassword, callback) {
			model.comparePassword(candidatePassword, callback);
		},

		removeUser: function(username, callback) {
			this.findUserByUsername(username, function(err, usr) {
				if(err) throw err;
				usr.remove();
				callback();
			})
		},

		removeBookmark: function(username, group, bkmrk, callback) {
			this.findUserByUsername(username, function(err, usr) {
				var removed = false;
				for(var i = 0; i < usr._doc.groups.length; i++) {	//Iterate over groups
					if(usr._doc.groups[i].name === group) {			//Until correct group is found
						for(var j = 0; j < usr._doc.groups[i].bookmarks.length; j++) {			//Iterate over bookmarks
							if(usr._doc.groups[i].bookmarks[j].address === bkmrk.address) {		//Until correct is found
								usr._doc.groups[i].bookmarks.splice(j,1);	//Remove it
								removed = true;
								break;
							}
						}
					}
					if(removed) {
						usr.markModified('groups');
						usr.save(function(err){
							callback(err);
						});
						break;				
					}
				}
			})
		}
	};

}();
module.exports = User;