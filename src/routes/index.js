var User = require('../models/user.js').User;
var utils = require('../utils.js');

//Home page or account page
exports.index = function(req, res){
	if (req.loggedIn){
		res.redirect('/user/' + req.user._doc.username);
	} else {
		res.render('index');
	}
};

//Account page
exports.account = function(req, res){
	User.find({ username: req.params[0] }, function(err, users){
    if(err) throw err;
    if(users.length == 0) {
    	res.render('404');
  	} else {
  		var viewableBMs = req.user
  												? req.params[0] === req.user._doc.username 
	  												? users[0]._doc.bookmarks 
	  												: utils.filterPublic(users[0]._doc.bookmarks)
  												: utils.filterPublic(users[0]._doc.bookmarks);
			res.render('account', { name: req.params[0], bookmarks: viewableBMs });
  	}
	});
};

exports.saveBookmark = function(req, res) {
	User.update(
		{ username: req.user._doc.username }, 
		{ '$push': { bookmarks: { address: req.body.address, imgAddress: req.body.imgAddress, private: req.body.private } } },
		{ upsert: true },
		function(err){
      if (err) throw err;
    }
	);
};

exports.saveScreen = function(req, res) {
	if(req.loggedIn) {
		res.render('savescreen', { title: req.query.title, address: req.query.address });
	} else {
	  res.render('index');
	}
}