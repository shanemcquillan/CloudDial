var user = require('../models/user.js');

//Account page
module.exports = function(req, res, next){
	var showAll = req.user && req.params.id == req.user._doc.username;
	var callback = function(grps){
			if(grps) {
				var username = req.user ? req.user._doc.username : undefined;
				res.render('account', {'username': username, 'name': req.params.id, 'groups': JSON.stringify(grps)});
			}
			else {
				next();
			}
		};

	if(showAll) {
		user.getBookmarks(req.params.id, function(grp){ return true; }, callback);
	} else {
		user.getPublicBookmarks(req.params.id, callback);
	}
};