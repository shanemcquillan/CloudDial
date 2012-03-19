var user = require('../models/user.js');

//Account page
module.exports = function(req, res, next){
	user.getBookmarks(
		req.params[0],
		function(bkmrk){
			var public = true;
			if(req.user){
				public = req.params[0] === req.user._doc.username ? true : !bkmrk.private;
			}
			return public;
		},
		function(bkmrks){
			if(bkmrks) {
				res.render('account', {'name': req.params[0], 'bookmarks': bkmrks});
			}
			else {
				next();
			}
		}
	)
};