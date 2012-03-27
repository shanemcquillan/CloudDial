var user = require('../models/user.js');

//Account page
module.exports = function(req, res, next){
	user.getBookmarks(
		req.params[0],
		function(grp){
			var public = true;
			if(req.user){	//Is the user logged in
				if(req.params[0] !== req.user._doc.username) {	//are they viewing someone elses bookmarks
					var bookmarks = new Array();
					grp.bookmarks.forEach(function(bkmrk){
						if(!bkmrk.private) {
							bookmarks.push(bkmrk);
						}
					})
					grp.bookmarks = bookmarks;
					return !grp.private;					
				}
			}
			return public;
		},
		function(grps){
			if(grps) {
				res.render('account', {'name': req.params[0], 'groups': JSON.stringify(grps), 'i': 0});
			}
			else {
				next();
			}
		}
	)
};