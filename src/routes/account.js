var User = require('../models/user.js').User;
var utils = require('../utils.js');

//Account page
module.exports = function(req, res){
	User.findOne({ username: req.params[0] }, function(err, user){
		if(err) throw err;
		if(!user) {
			res.render('404');
		} else {
			var viewableBMs = req.user
													? req.params[0] === req.user._doc.username 
														? user._doc.bookmarks 
														: utils.filterPublic(user._doc.bookmarks)
													: utils.filterPublic(user._doc.bookmarks);
			res.render('account', { name: req.params[0], bookmarks: viewableBMs });
		}
	});
};