//Home page or account page
module.exports = function(req, res){
	if (req.user) {
		res.redirect('/user/' + req.user._doc.username);
	} else {
		res.render('index');
	}
};