var User = require('../models/user.js').User;

//Home page or account page
exports.index = function(req, res){
	if (req.loggedIn){
		res.redirect('/user/' + req.user._doc.username);
	} else {
	  res.render('index', { title: 'Cloud Dial' });
	}
};

//Account page
exports.account = function(req, res){
	User.find({ username: req.params[0] }, function(err, users){
    if(err) throw err;
    if(users.length == 0) {
    	res.render('404');
  	} else {
			res.render('account', { name: req.params[0], bookmarks: users[0]._doc.bookmarks });
  	}
	});
};

exports.saveBookmark = function(req, res) {
	User.update(
		{ username: req.user._doc.username }, 
		{ '$push': { bookmarks: { address: req.body.address, imgAddress: req.body.imgAddress } } },
		{ upsert: true }, 
		function(err){
      if (err) throw err;
    }
	);
};