//Home page or account page
module.exports = function(req, res){
	if (req.loggedIn){
		res.redirect('/user/' + req.user._doc.username);
	} else {
		res.render('index');
	}
};