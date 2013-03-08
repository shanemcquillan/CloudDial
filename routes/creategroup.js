var user = require('../models/user.js');

module.exports = function(req, res) {
	if(!(req.user && req.body.name)) return;

	if(req.user && req.params.id === req.user._doc.username) {
		user.addGroup(req.user._doc.username, {name: req.body.name, private: req.body.private}, function(){});
	}
};
